param(
  [string]$ProjectRoot = $PSScriptRoot,
  [string]$ChangeSummary = "",
  [string]$NotesFileName = "VERSION_NOTES.txt"
)

$ErrorActionPreference = "Stop"

$backupDir = Join-Path $ProjectRoot "previous-versions"
$timestamp = Get-Date -Format "yyyy-MM-dd-HH-mm-ss"
$archiveName = "site-$timestamp.zip"
$archivePath = Join-Path $backupDir $archiveName
$tempRoot = Join-Path $ProjectRoot (".backup-temp-" + [guid]::NewGuid().ToString())
$stagingDir = Join-Path $tempRoot "site"

New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null

$previousArchive = Get-ChildItem -LiteralPath $backupDir -Filter "site-*.zip" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

try {
  Get-ChildItem -LiteralPath $ProjectRoot -Force | Where-Object {
    $_.Name -ne "previous-versions" -and -not $_.Name.StartsWith(".backup-temp-")
  } | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $stagingDir -Recurse -Force
  }

  $previousArchiveName = if ($previousArchive) { $previousArchive.Name } else { "Предыдущей архивной версии нет" }
  $summaryText = if ([string]::IsNullOrWhiteSpace($ChangeSummary)) {
    "Описание изменений не было указано."
  } else {
    $ChangeSummary.Trim()
  }

  $notesContent = @(
    "Файл архива: $archiveName"
    "Создан: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    "Предыдущая архивная версия: $previousArchiveName"
    ""
    "Изменения в этой версии:"
    $summaryText
  )

  Set-Content -LiteralPath (Join-Path $stagingDir $NotesFileName) -Value $notesContent -Encoding utf8

  Compress-Archive -Path (Join-Path $stagingDir "*") -DestinationPath $archivePath -CompressionLevel Optimal -Force
  Write-Output $archivePath
}
finally {
  if (Test-Path $tempRoot) {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force
  }
}

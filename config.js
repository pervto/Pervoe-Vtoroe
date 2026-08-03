const CONFIG = {
  // Номер WhatsApp без символа +
  whatsappNumber: "77785574506",

  // Ссылка на Google Документ с текстом политики конфиденциальности.
  // Документ должен открываться по ссылке без запроса доступа.
  // Пример:
  // https://docs.google.com/document/d/ВАШ_ID/edit?usp=sharing
  privacyPolicyUrl: "https://docs.google.com/document/d/e/2PACX-1vTErDdnIAiTUUIv110rnRTzsewAFCRuPjciq4DIdA-q-Bp6GCNy8xTpiDb2f3aKaBd7edQXg3bufJ8t/pub",

  // Публичная CSV-ссылка из Google Sheets
  // Пример:
  // https://docs.google.com/spreadsheets/d/e/ВАШ_ID/pub?output=csv
  csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT3joTj2hKkKgH3WJ0tMISWQeXtbb7aPA85HMAqV54F1gWPp-HNWPJ1TjegOGq85E6eFBKcjl0X_cXN/pub?output=csv",

  // Optional faster mode:
  // paste the regular sheet link here and keep the sheet shared as "Anyone with the link" -> "Viewer"
  // Example:
  // https://docs.google.com/spreadsheets/d/ВАШ_ID/edit#gid=0
  sheetUrl: "",

  // Optional direct sheet id for the fastest sync mode.
  // Example:
  // 1AbCDefGhIJKlmNoPQRstuVWxyz1234567890
  sheetId: "",

  // Optional sheet tab id for faster direct sync. "0" is usually the first tab.
  sheetGid: "0"
};

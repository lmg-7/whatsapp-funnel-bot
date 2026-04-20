// ==============================
// google-apps-script.js
// انسخ هذا الكود في Google Apps Script
// Tools > Script Editor أو script.google.com
// ==============================

function doGet(e) {
  const action = e.parameter.action;
  const sheet  = SpreadsheetApp.getActiveSheet();

  try {

    // ---- التحقق من إيميل ----
    if (action === 'check') {
      const email = e.parameter.email;
      const data  = sheet.getDataRange().getValues();

      for (let i = 0; i < data.length; i++) {
        if (String(data[i][1]).toLowerCase() === String(email).toLowerCase()) {
          return ContentService.createTextOutput("FOUND");
        }
      }
      return ContentService.createTextOutput("NOT_FOUND");
    }

    // ---- إضافة عميل جديد ----
    else if (action === 'add') {
      const phone  = e.parameter.phone  || '';
      const email  = e.parameter.email  || '';
      const status = e.parameter.status || 'lead';
      const date   = e.parameter.date   || new Date().toISOString();

      // تجنب التكرار
      const data = sheet.getDataRange().getValues();
      for (let i = 0; i < data.length; i++) {
        if (data[i][0] === phone) {
          return ContentService.createTextOutput("EXISTS");
        }
      }

      sheet.appendRow([phone, email, status, date]);
      return ContentService.createTextOutput("ADDED");
    }

    // ---- تحديث حالة العميل ----
    else if (action === 'update') {
      const phone  = e.parameter.phone;
      const status = e.parameter.status;
      const data   = sheet.getDataRange().getValues();

      for (let i = 0; i < data.length; i++) {
        if (data[i][0] === phone) {
          sheet.getRange(i + 1, 3).setValue(status);
          sheet.getRange(i + 1, 4).setValue(new Date().toISOString());
          return ContentService.createTextOutput("UPDATED");
        }
      }
      return ContentService.createTextOutput("NOT_FOUND");
    }

    else {
      return ContentService.createTextOutput("UNKNOWN_ACTION");
    }

  } catch (err) {
    return ContentService.createTextOutput("ERROR: " + err.message);
  }
}

// ==============================
// خطوات النشر:
// 1. Deploy > New Deployment
// 2. Type: Web App
// 3. Execute as: Me
// 4. Who has access: Anyone
// 5. انسخ الرابط وضعه في .env كـ SHEET_API_URL
// ==============================

// ==============================
// sheets.js - التعامل مع Google Sheets
// ==============================

const axios = require('axios');

/**
 * التحقق من وجود الإيميل في Google Sheets
 * @param {string} email
 * @returns {boolean}
 */
async function checkEmail(email) {
  try {
    const url = `${process.env.SHEET_API_URL}?action=check&email=${encodeURIComponent(email)}`;
    const res = await axios.get(url, { timeout: 5000 });
    return res.data === "FOUND";
  } catch (err) {
    console.error("❌ خطأ في Google Sheets (checkEmail):", err.message);
    return false;
  }
}

/**
 * إضافة عميل جديد إلى Google Sheets
 * @param {string} phone
 * @param {string} email
 * @param {string} status
 */
async function addCustomer(phone, email, status = "lead") {
  try {
    const url = `${process.env.SHEET_API_URL}?action=add&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&status=${status}&date=${new Date().toISOString()}`;
    await axios.get(url, { timeout: 5000 });
    console.log(`✅ تم إضافة العميل: ${phone}`);
  } catch (err) {
    console.error("❌ خطأ في Google Sheets (addCustomer):", err.message);
  }
}

/**
 * تحديث حالة العميل
 * @param {string} phone
 * @param {string} status
 */
async function updateStatus(phone, status) {
  try {
    const url = `${process.env.SHEET_API_URL}?action=update&phone=${encodeURIComponent(phone)}&status=${status}`;
    await axios.get(url, { timeout: 5000 });
  } catch (err) {
    console.error("❌ خطأ في Google Sheets (updateStatus):", err.message);
  }
}

module.exports = { checkEmail, addCustomer, updateStatus };

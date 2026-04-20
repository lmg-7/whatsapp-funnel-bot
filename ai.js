// ==============================
// ai.js - الذكاء الاصطناعي (OpenAI)
// ==============================

const axios = require('axios');

const SALES_SYSTEM_PROMPT = `
أنت مساعد مبيعات ذكي ومحترف باللغة العربية.
مهمتك: إقناع العملاء المحتملين بشراء المنتج الرقمي.

قواعدك:
- ردود قصيرة وواضحة (3-5 جمل كحد أقصى)
- أسلوب ودي ومقنع
- ركز دائمًا على الفوائد وليس المميزات
- إذا سأل عن السعر، قل إنه استثمار وليس تكلفة
- في نهاية كل رد، اطرح سؤالاً يدفع العميل للأمام
- إذا كان العميل مترددًا، اذكر ضمان الاسترداد
`;

/**
 * إرسال سؤال للـ AI والحصول على رد
 * @param {string} userMessage
 * @returns {string}
 */
async function askAI(userMessage) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        max_tokens: 300,
        messages: [
          { role: "system", content: SALES_SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    return res.data.choices[0].message.content;

  } catch (err) {
    console.error("❌ خطأ في OpenAI:", err.message);
    return "عذرًا، سأرد عليك قريبًا. كيف أقدر أساعدك؟ 😊";
  }
}

module.exports = { askAI };

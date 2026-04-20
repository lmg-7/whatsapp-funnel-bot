// ==============================
// index.js - نظام البيع الكامل عبر واتساب
// WhatsApp Funnel Bot - Full Sales System
// ==============================

require('dotenv').config();

const express    = require('express');
const bodyParser = require('body-parser');

const { checkEmail, addCustomer, updateStatus } = require('./sheets');
const { askAI }                                  = require('./ai');
const { getPaymentLink, createCheckoutSession, verifyWebhook } = require('./payment');

const app = express();

// ==============================
// Middleware
// ==============================
app.use(bodyParser.urlencoded({ extended: false }));

// Stripe Webhook يحتاج raw body
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// ==============================
// حالات المستخدمين (In-Memory)
// للإنتاج: استبدلها بـ Redis أو MongoDB
// ==============================
const userState = {};

// ==============================
// دوال مساعدة
// ==============================

/** بناء رد XML لـ Twilio */
function twimlResponse(message) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${message}</Message>
</Response>`;
}

/** إرسال رد XML */
function sendReply(res, message) {
  res.type('text/xml');
  res.send(twimlResponse(message));
}

/** استخراج الرقم النظيف */
function cleanPhone(from) {
  return from.replace('whatsapp:', '');
}

// ==============================
// الرسائل الجاهزة
// ==============================
const MESSAGES = {

  welcome: `👋 أهلاً وسهلاً!

هل تعاني من:
❌ صعوبة تحويل أفكارك إلى دخل؟
❌ عدم معرفة من أين تبدأ؟

🔥 عندي لك النظام المثالي

اكتب *1* لعرض التفاصيل`,

  offer: `💡 هذا ما ستحصل عليه:

✅ نظام بيع تلقائي 24/7
✅ Funnel جاهز ومثبت
✅ دعم شخصي لمدة 30 يومًا
✅ تحديثات مجانية مدى الحياة

💰 السعر الآن: *49$* فقط
(بدلاً من 199$ - خصم 75%)

⏳ العرض ينتهي اليوم!

اكتب *2* للشراء الآن
اكتب *3* لأي سؤال`,

  askEmail: `📧 أرسل لي إيميلك للتحقق من هويتك:`,

  emailNotFound: `❌ الإيميل غير مسجل.

هل أنت عميل جديد؟ اكتب *تسجيل*
أو تواصل معنا مباشرة`,

  thankYou: `🎉 تم الدفع بنجاح!

هذا رابط منتجك:
${process.env.PRODUCT_URL}

💬 للدعم: اكتب *مساعدة*`,

  askQuestion: `💬 اكتب سؤالك وسأرد عليك فورًا:`,

  fallback: `❓ لم أفهم طلبك.

اكتب *مرحبا* للبدء من جديد
أو *مساعدة* للتواصل مع فريقنا`
};

// ==============================
// المسار الرئيسي - استقبال رسائل واتساب
// ==============================
app.post('/whatsapp', async (req, res) => {

  const rawMsg = req.body.Body || '';
  const msg    = rawMsg.trim().toLowerCase();
  const from   = req.body.From || '';
  const phone  = cleanPhone(from);

  console.log(`📩 من ${phone}: ${rawMsg}`);

  // تهيئة حالة المستخدم
  if (!userState[from]) {
    userState[from] = { step: 'start', data: {} };
  }

  const state = userState[from];
  let reply   = '';

  try {

    // ==============================
    // منطق الـ Funnel
    // ==============================

    // ---- الترحيب ----
    if (state.step === 'start' || msg === 'مرحبا' || msg === 'hi' || msg === 'هاي') {
      reply = MESSAGES.welcome;
      state.step = 'menu';
      await addCustomer(phone, '', 'new_lead');
    }

    // ---- القائمة الرئيسية ----
    else if (state.step === 'menu') {

      if (msg === '1') {
        reply = MESSAGES.offer;
        state.step = 'offer';
      }

      else if (msg === '2') {
        reply = MESSAGES.askQuestion;
        state.step = 'ai';
      }

      else {
        reply = MESSAGES.welcome;
      }
    }

    // ---- عرض المنتج ----
    else if (state.step === 'offer') {

      if (msg === '1') {
        reply = MESSAGES.offer;
      }

      else if (msg === '2') {
        // إنشاء رابط دفع مخصص
        const paymentUrl = await createCheckoutSession(phone);
        reply = `🔗 رابط الدفع الآمن:\n${paymentUrl}\n\n✅ مضمون 100% أو استرداد كامل`;
        state.step = 'awaiting_payment';
        await updateStatus(phone, 'checkout_started');
      }

      else if (msg === '3') {
        reply = MESSAGES.askQuestion;
        state.step = 'ai';
      }

      else {
        reply = MESSAGES.offer;
      }
    }

    // ---- انتظار الدفع ----
    else if (state.step === 'awaiting_payment') {

      if (msg === 'مرحبا' || msg === 'تم') {
        reply = '⏳ نتحقق من دفعتك... انتظر لحظة';
      }

      else {
        // AI يساعد في إغلاق البيع
        reply = await askAI(`العميل يقول: "${rawMsg}"\n\nهو في مرحلة الدفع ومتردد. ساعده على اتخاذ القرار.`);
      }
    }

    // ---- الذكاء الاصطناعي ----
    else if (state.step === 'ai') {
      reply = await askAI(rawMsg);

      // بعد 3 ردود من AI، ارجع للعرض
      state.data.aiCount = (state.data.aiCount || 0) + 1;

      if (state.data.aiCount >= 3) {
        reply += '\n\n🔥 هل أنت مستعد للبدء؟ اكتب *2* لرؤية العرض';
        state.step = 'offer';
        state.data.aiCount = 0;
      }
    }

    // ---- Fallback ----
    else {
      reply = MESSAGES.fallback;
      state.step = 'start';
    }

  } catch (err) {
    console.error('❌ خطأ في المعالجة:', err.message);
    reply = '⚠️ حدث خطأ مؤقت. حاول مرة أخرى أو تواصل معنا.';
  }

  console.log(`📤 الرد: ${reply.substring(0, 60)}...`);
  sendReply(res, reply);
});


// ==============================
// Stripe Webhook - تسليم المنتج بعد الدفع
// ==============================
app.post('/webhook', (req, res) => {
  const sig   = req.headers['stripe-signature'];
  const event = verifyWebhook(req.body, sig);

  if (!event) {
    return res.status(400).send('Webhook Error');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const phone   = session.metadata?.phone;

    if (phone) {
      const whatsappFrom = `whatsapp:${phone}`;

      // تحديث حالة المستخدم
      if (userState[whatsappFrom]) {
        userState[whatsappFrom].step = 'paid';
      }

      // تحديث Google Sheets
      updateStatus(phone, 'paid').catch(console.error);

      // ✅ هنا ترسل المنتج (عبر Twilio API مباشرة)
      // sendProductViaWhatsApp(phone);
      console.log(`💰 تم الدفع من: ${phone}`);
    }
  }

  res.sendStatus(200);
});


// ==============================
// صفحة الحالة
// ==============================
app.get('/', (req, res) => {
  res.json({
    status: '🟢 يعمل',
    bot: 'WhatsApp Funnel Bot',
    version: '1.0.0',
    uptime: process.uptime().toFixed(0) + 's'
  });
});


// ==============================
// تشغيل السيرفر
// ==============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
🚀 ====================================
   WhatsApp Funnel Bot - يعمل!
====================================
🌐 السيرفر: http://localhost:${PORT}
📱 Webhook: http://localhost:${PORT}/whatsapp
💳 Stripe:  http://localhost:${PORT}/webhook
====================================
  `);
});

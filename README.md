# 🚀 WhatsApp Funnel Bot - نظام بيع تلقائي كامل

نظام بيع متكامل عبر واتساب يعمل 24/7.  
**Twilio + Google Sheets + OpenAI + Stripe**

---

## 📁 هيكل المشروع

```
whatsapp-funnel-bot/
├── index.js                ← السيرفر الرئيسي + منطق البوت
├── sheets.js               ← التعامل مع Google Sheets
├── ai.js                   ← الذكاء الاصطناعي (OpenAI)
├── payment.js              ← الدفع (Stripe)
├── google-apps-script.js   ← كود Apps Script للـ Sheets
├── landing-page/
│   └── index.html          ← صفحة الهبوط
├── .env.example            ← نموذج إعدادات البيئة
├── .gitignore
└── package.json
```

---

## ⚙️ طريقة الإعداد

### 1. استنساخ المشروع
```bash
git clone https://github.com/YOUR_USERNAME/whatsapp-funnel-bot.git
cd whatsapp-funnel-bot
npm install
```

### 2. إعداد ملف البيئة
```bash
cp .env.example .env
```
ثم افتح `.env` وأضف مفاتيحك (راجع الخطوات أدناه).

---

## 🔑 الحصول على المفاتيح

### Twilio (واتساب)
1. سجل في [twilio.com](https://twilio.com)
2. اذهب إلى **Messaging > Try it out > Send a WhatsApp message**
3. انسخ `Account SID` و `Auth Token`
4. اتبع تعليمات WhatsApp Sandbox

### OpenAI
1. اذهب إلى [platform.openai.com](https://platform.openai.com)
2. **API Keys > Create new secret key**
3. انسخ المفتاح في `.env`

### Stripe
1. سجل في [stripe.com](https://stripe.com)
2. اذهب إلى **Developers > API keys**
3. انسخ `Secret key`
4. أنشئ **Payment Link** من لوحة التحكم
5. للـ Webhook: **Developers > Webhooks > Add endpoint**
   - URL: `https://your-domain.com/webhook`
   - Event: `checkout.session.completed`

### Google Sheets
1. افتح Google Sheets وأنشئ جدول جديد
2. أضف عناوين الأعمدة: `Phone | Email | Status | Date`
3. اذهب إلى **Extensions > Apps Script**
4. انسخ كود `google-apps-script.js`
5. **Deploy > New deployment > Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. انسخ رابط الـ Web App في `.env`

---

## 🚀 تشغيل المشروع

```bash
# تشغيل عادي
npm start

# تشغيل مع إعادة التشغيل التلقائي (للتطوير)
npm run dev
```

---

## 🌐 النشر (Deploy)

### خيار 1: Render (موصى به - مجاني)
1. اذهب إلى [render.com](https://render.com)
2. **New > Web Service**
3. اربط مستودع GitHub
4. أضف متغيرات البيئة من `.env`
5. ابدأ التشغيل

### خيار 2: Railway
1. اذهب إلى [railway.app](https://railway.app)
2. **New Project > Deploy from GitHub**
3. أضف متغيرات البيئة

### بعد النشر:
اذهب إلى Twilio Sandbox وأضف رابط الـ Webhook:
```
https://your-app.render.com/whatsapp
```

---

## 📱 رحلة العميل داخل البوت

```
العميل يكتب "مرحبا"
        ↓
البوت يرسل عرض القيمة
        ↓
العميل يختار "1" (تفاصيل)
        ↓
عرض المنتج + السعر
        ↓
العميل يختار "2" (شراء)
        ↓
رابط دفع Stripe مخصص
        ↓
بعد الدفع: Stripe Webhook
        ↓
تسليم المنتج تلقائيًا ✅
```

---

## 🔧 تخصيص البوت

### تغيير الرسائل
في `index.js`، ابحث عن `MESSAGES` وعدّل النصوص.

### تغيير سعر المنتج
في `payment.js`:
```js
async function createCheckoutSession(phone, amountUSD = 49, productName = "اسم المنتج")
```
غيّر `49` للسعر المطلوب.

### إضافة منتجات متعددة
أضف خيارات في القائمة وأنشئ Payment Links مختلفة في Stripe.

---

## 📊 Google Sheets - بنية البيانات

| العمود | البيانات |
|--------|----------|
| A | رقم الهاتف |
| B | الإيميل |
| C | الحالة (new_lead / checkout_started / paid) |
| D | التاريخ |

---

## 🛠️ تطويرات مستقبلية

- [ ] حفظ حالات المستخدمين في Redis
- [ ] رسائل Follow-up تلقائية
- [ ] إرسال المنتج كملف PDF مباشرة
- [ ] لوحة تحكم لمتابعة المبيعات
- [ ] دعم متعدد اللغات

---

## 📄 الترخيص

MIT License - حر الاستخدام للمشاريع التجارية والشخصية.

---

**بُني بـ ❤️ لمساعدة رواد الأعمال العرب على البيع تلقائيًا**

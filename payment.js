// ==============================
// payment.js - إدارة الدفع عبر Stripe
// ==============================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * إرجاع رابط الدفع الجاهز
 */
function getPaymentLink() {
  return process.env.STRIPE_PAYMENT_LINK || "https://buy.stripe.com/your-link";
}

/**
 * إنشاء Checkout Session مخصصة
 * @param {string} customerPhone
 * @param {number} amountUSD
 * @param {string} productName
 * @returns {string} رابط الدفع
 */
async function createCheckoutSession(customerPhone, amountUSD = 49, productName = "المنتج الرقمي") {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: productName },
            unit_amount: amountUSD * 100
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.PRODUCT_URL}?success=true`,
      cancel_url: `${process.env.PRODUCT_URL}?cancelled=true`,
      metadata: { phone: customerPhone }
    });

    return session.url;
  } catch (err) {
    console.error("❌ خطأ في Stripe:", err.message);
    return getPaymentLink();
  }
}

/**
 * التحقق من صحة Stripe Webhook
 * @param {Buffer} rawBody
 * @param {string} signature
 * @returns {object|null}
 */
function verifyWebhook(rawBody, signature) {
  try {
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook غير صالح:", err.message);
    return null;
  }
}

module.exports = { getPaymentLink, createCheckoutSession, verifyWebhook };

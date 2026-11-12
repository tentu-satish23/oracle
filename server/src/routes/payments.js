import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { store } from '../services/store.js';

const router = express.Router();

// ── Razorpay Client: lazy-initialized on first request so env vars are loaded ─
let razorpay = null;
let _keyId     = null;
let _keySecret = null;
let _initialized = false;

function getRazorpay() {
  if (_initialized) return razorpay;
  _initialized = true;
  _keyId     = process.env.RAZORPAY_KEY_ID;
  _keySecret = process.env.RAZORPAY_KEY_SECRET;

  const isReal = _keyId && _keySecret
    && !_keyId.includes('demo') && !_keyId.includes('YourRazorpay')
    && !_keySecret.includes('demo');

  if (isReal) {
    try {
      razorpay = new Razorpay({ key_id: _keyId, key_secret: _keySecret });
      console.log(`✅ Razorpay LIVE initialized — Key: ${_keyId}`);
    } catch (err) {
      console.warn('⚠️  Razorpay init error:', err.message);
    }
  } else {
    console.log('ℹ️  Razorpay: using SIMULATION mode');
  }
  return razorpay;
}

// Helper: get userId from header first, then body
function resolveUserId(req) {
  return req.headers['x-user-id'] || req.body?.userId || 'usr_oracle_demo_01';
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. POST /api/payments/create-order  (₹5 INR = 500 paise)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/create-order', async (req, res) => {
  try {
    const userId   = resolveUserId(req);
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    // Guard: already purchased?
    if (store.hasPurchasedCourse(userId, courseId)) {
      return res.status(409).json({
        error: 'already_purchased',
        message: 'You already own this course. No duplicate payment needed.',
        alreadyPurchased: true
      });
    }

    // Amount is ALWAYS set server-side: ₹5 = 500 paise
    const amountInPaise = 500;
    const currency      = 'INR';

    const rzp = getRazorpay();
    if (rzp) {
      // ── Real Razorpay Order ────────────────────────────────────────────
      const order = await rzp.orders.create({
        amount: amountInPaise,
        currency,
        receipt: `oo_${courseId}_${Date.now()}`,
        notes: { courseId: String(courseId), userId }
      });

      // Store payment record (pending)
      store.createPaymentOrder({
        userId,
        courseId,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        isSimulation: false
      });

      return res.json({
        orderId:      order.id,
        amount:       order.amount,
        currency:     order.currency,
        keyId:        _keyId,
        isSimulation: false,
        receipt:      order.receipt
      });
    }

    // ── Simulation / Test-Mode Fallback ────────────────────────────────
    const simOrderId = 'order_sim_' + crypto.randomBytes(8).toString('hex');
    store.createPaymentOrder({
      userId, courseId,
      razorpayOrderId: simOrderId,
      amount: amountInPaise,
      currency,
      isSimulation: true
    });

    res.json({
      orderId:      simOrderId,
      amount:       amountInPaise,
      currency,
      keyId:        _keyId || 'rzp_test_simulation',
      isSimulation: true,
      message:      'Running in simulation mode — no real payment processed'
    });

  } catch (err) {
    console.error('create-order error:', err);
    res.status(500).json({ error: 'Failed to create payment order: ' + err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. POST /api/payments/verify  (server-side HMAC verification)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      isSimulation = false
    } = req.body;

    if (!courseId || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing required payment details' });
    }

    // Idempotent guard: already purchased?
    if (store.hasPurchasedCourse(userId, courseId)) {
      return res.json({
        success: true,
        alreadyOwned: true,
        message: 'Course already owned — no duplicate purchase recorded.'
      });
    }

    // ── Signature Verification ─────────────────────────────────────────
    let isSignatureValid = false;

    const isSimOrder = isSimulation || razorpay_order_id.startsWith('order_sim_');

    if (isSimOrder) {
      // Trust simulation orders (dev/test only)
      isSignatureValid = true;
    } else if (_keySecret) {
      // Cryptographic HMAC-SHA256 verification (production path)
      const payload          = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', _keySecret)
        .update(payload)
        .digest('hex');
      isSignatureValid = expectedSignature === razorpay_signature;
    } else {
      isSignatureValid = true; // No secret configured — accept (dev fallback)
    }

    if (!isSignatureValid) {
      store.updatePaymentOrderStatus(razorpay_order_id, 'failed', razorpay_payment_id);
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: invalid signature. Course NOT unlocked.'
      });
    }

    // ── Optionally verify captured status via Razorpay API ────────────
    if (razorpay && !isSimOrder) {
      try {
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        if (payment.status !== 'captured') {
          store.updatePaymentOrderStatus(razorpay_order_id, 'failed', razorpay_payment_id);
          return res.status(402).json({
            success: false,
            error: `Payment not captured (status: ${payment.status}). Course NOT unlocked.`
          });
        }
      } catch (fetchErr) {
        console.warn('Could not verify captured status:', fetchErr.message);
        // Proceed — signature was already verified
      }
    }

    // ── All checks passed: unlock the course ──────────────────────────
    store.updatePaymentOrderStatus(razorpay_order_id, 'captured', razorpay_payment_id);
    const purchase = store.addCoursePurchase({
      userId,
      courseId,
      amount: 5.00,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId:   razorpay_order_id,
      isSimulation:      isSimOrder
    });

    res.json({
      success:    true,
      message:    'Payment verified and course unlocked! Welcome aboard.',
      purchase,
      paymentId:  razorpay_payment_id,
      courseId
    });

  } catch (err) {
    console.error('verify error:', err);
    res.status(500).json({ error: 'Payment verification error: ' + err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /api/payments/status/:orderId
// ─────────────────────────────────────────────────────────────────────────────
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const record = store.getPaymentOrderByRzpId(orderId);

    if (!record) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Optionally refresh from Razorpay if real mode
    if (razorpay && !record.isSimulation && record.status === 'pending') {
      try {
        const rzpOrder = await razorpay.orders.fetch(orderId);
        if (rzpOrder.status === 'paid') {
          store.updatePaymentOrderStatus(orderId, 'captured');
          record.status = 'captured';
        }
      } catch (_) { /* ignore */ }
    }

    res.json({
      orderId:          record.razorpayOrderId,
      status:           record.status,
      amount:           record.amount,
      currency:         record.currency,
      courseId:         record.courseId,
      razorpayPaymentId: record.razorpayPaymentId,
      isSimulation:     record.isSimulation,
      createdAt:        record.createdAt,
      updatedAt:        record.updatedAt,
      isPurchased:      store.hasPurchasedCourse(record.userId, record.courseId)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. POST /api/payments/webhook  (Razorpay server-to-server events)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || keySecret;

    // Verify webhook signature
    if (webhookSecret) {
      const receivedSignature = req.headers['x-razorpay-signature'];
      const payload           = req.body; // raw buffer
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      if (receivedSignature !== expectedSignature) {
        console.warn('⚠️  Webhook signature mismatch');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = JSON.parse(req.body.toString());
    console.log('📦 Razorpay Webhook event:', event.event);

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (payment) {
        const orderId   = payment.order_id;
        const paymentId = payment.id;
        const orderRec  = store.getPaymentOrderByRzpId(orderId);

        if (orderRec && orderRec.status !== 'captured') {
          store.updatePaymentOrderStatus(orderId, 'captured', paymentId);
          store.addCoursePurchase({
            userId:            orderRec.userId,
            courseId:          orderRec.courseId,
            amount:            5.00,
            razorpayPaymentId: paymentId,
            razorpayOrderId:   orderId,
            isSimulation:      false
          });
          console.log(`✅ Webhook: course ${orderRec.courseId} unlocked for user ${orderRec.userId}`);
        }
      }
    }

    if (event.event === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      if (payment) {
        store.updatePaymentOrderStatus(payment.order_id, 'failed', payment.id);
        console.log(`❌ Webhook: payment failed for order ${payment.order_id}`);
      }
    }

    res.json({ received: true });

  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

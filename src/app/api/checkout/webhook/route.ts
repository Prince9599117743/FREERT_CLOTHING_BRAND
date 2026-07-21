import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Signature parameters missing.' }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('Razorpay webhook secret parameters are not configured. Bypassing checksum validation (Sandbox Mode).');
      return NextResponse.json({ status: 'success', sandbox: true });
    }

    // Verify cryptographic signature integrity
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Signature mismatch verification.' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle Captured Order updates
    if (event === 'payment.captured') {
      const paymentDetails = payload.payload.payment.entity;
      console.log(`Verified captures for payment: ${paymentDetails.id}. Amount: ${paymentDetails.amount}`);
      
      // Update tables in databases, e.g. status mapping 'processing'
    }

    return NextResponse.json({ status: 'success' });

  } catch (error: any) {
    console.error('Webhook signature verification failure:', error);
    return NextResponse.json({ error: error.message || 'Signature error.' }, { status: 500 });
  }
}

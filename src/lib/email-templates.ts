// Professional HTML Email Templates for FREERT
// All templates follow a premium luxury brand aesthetic

const BRAND_COLORS = {
  bg: '#FDFAF6',
  text: '#1A1A1A',
  muted: '#6B6B6B',
  border: '#E8E0D6',
  accent: '#C8A96E',
  danger: '#8B2020',
  success: '#1A5E1A',
};

const baseWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>FREERT</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0EA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#FDFAF6;border:1px solid #E8E0D6;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #E8E0D6;text-align:center;">
              <p style="margin:0;font-size:22px;letter-spacing:0.3em;font-weight:300;color:#1A1A1A;text-transform:uppercase;">FREERT</p>
              <p style="margin:6px 0 0;font-size:8px;letter-spacing:0.25em;color:#9B9B9B;text-transform:uppercase;">Luxury Minimalist Fashion</p>
            </td>
          </tr>

          <!-- Body -->
          ${content}

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #E8E0D6;text-align:center;background:#F5F0EA;">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.18em;color:#9B9B9B;text-transform:uppercase;">Need help? Contact us at</p>
              <p style="margin:0 0 4px;font-size:9px;color:#6B6B6B;">freertofficial@gmail.com</p>
              <p style="margin:0 0 12px;font-size:9px;color:#6B6B6B;">+91 84680 17123</p>
              <p style="margin:0;font-size:8px;letter-spacing:0.12em;color:#B0B0B0;text-transform:uppercase;">© ${new Date().getFullYear()} FREERT. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─────────────────────────────────────────────
// 1. ORDER CONFIRMATION EMAIL
// ─────────────────────────────────────────────
export interface OrderEmailData {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    name: string;
    size: string;
    color: string;
    qty: number;
    price: number;
    image?: string;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  trackingUrl?: string;
}

export function orderConfirmationTemplate(data: OrderEmailData): string {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #F0EBE3;">
        <p style="margin:0 0 2px;font-size:11px;font-weight:500;color:#1A1A1A;letter-spacing:0.05em;">${item.name}</p>
        <p style="margin:0;font-size:9px;color:#9B9B9B;letter-spacing:0.08em;text-transform:uppercase;">Size: ${item.size} &nbsp;·&nbsp; Colour: ${item.color} &nbsp;·&nbsp; Qty: ${item.qty}</p>
      </td>
      <td style="padding:12px 0 12px 16px;border-bottom:1px solid #F0EBE3;text-align:right;white-space:nowrap;">
        <p style="margin:0;font-size:11px;color:#1A1A1A;">₹${(item.price * item.qty).toLocaleString('en-IN')}</p>
      </td>
    </tr>
  `).join('');

  const body = `
  <tr>
    <td style="padding:32px 40px 0;">
      <p style="margin:0 0 6px;font-size:18px;font-weight:300;color:#1A1A1A;letter-spacing:0.05em;">Thank you for your order.</p>
      <p style="margin:0;font-size:10px;color:#9B9B9B;letter-spacing:0.12em;text-transform:uppercase;">We've received your order and are preparing it.</p>
    </td>
  </tr>

  <!-- Order Badge -->
  <tr>
    <td style="padding:24px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1A1A;padding:16px 20px;">
        <tr>
          <td>
            <p style="margin:0 0 2px;font-size:8px;letter-spacing:0.2em;color:#9B9B9B;text-transform:uppercase;">Order Reference</p>
            <p style="margin:0;font-size:18px;font-weight:300;color:#FDFAF6;letter-spacing:0.15em;">${data.orderNumber}</p>
          </td>
          <td align="right">
            <p style="margin:0 0 2px;font-size:8px;letter-spacing:0.2em;color:#9B9B9B;text-transform:uppercase;">Date & Time</p>
            <p style="margin:0;font-size:10px;color:#C8C8C8;letter-spacing:0.08em;">${data.orderDate}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Items Table -->
  <tr>
    <td style="padding:24px 40px 0;">
      <p style="margin:0 0 12px;font-size:8px;letter-spacing:0.2em;color:#9B9B9B;text-transform:uppercase;border-bottom:1px solid #E8E0D6;padding-bottom:8px;">Order Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemRows}
      </table>
    </td>
  </tr>

  <!-- Totals -->
  <tr>
    <td style="padding:16px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${data.discount > 0 ? `
        <tr>
          <td style="padding:4px 0;font-size:10px;color:#6B6B6B;">Subtotal</td>
          <td style="padding:4px 0;font-size:10px;color:#6B6B6B;text-align:right;">₹${data.subtotal.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:10px;color:#1A5E1A;">Discount Applied</td>
          <td style="padding:4px 0;font-size:10px;color:#1A5E1A;text-align:right;">− ₹${data.discount.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding:10px 0 4px;font-size:12px;font-weight:600;color:#1A1A1A;border-top:1px solid #E8E0D6;">Total Paid</td>
          <td style="padding:10px 0 4px;font-size:12px;font-weight:600;color:#1A1A1A;text-align:right;border-top:1px solid #E8E0D6;">₹${data.total.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding:0;font-size:9px;color:#9B9B9B;">Payment Method</td>
          <td style="padding:0;font-size:9px;color:#9B9B9B;text-align:right;">${data.paymentMethod}</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Shipping Address -->
  <tr>
    <td style="padding:24px 40px 0;">
      <p style="margin:0 0 10px;font-size:8px;letter-spacing:0.2em;color:#9B9B9B;text-transform:uppercase;border-bottom:1px solid #E8E0D6;padding-bottom:8px;">Delivery Address</p>
      <p style="margin:0 0 2px;font-size:11px;font-weight:500;color:#1A1A1A;">${data.shippingAddress.fullName}</p>
      <p style="margin:0 0 2px;font-size:10px;color:#6B6B6B;">${data.shippingAddress.street}</p>
      <p style="margin:0 0 2px;font-size:10px;color:#6B6B6B;">${data.shippingAddress.city}, ${data.shippingAddress.state} — ${data.shippingAddress.postalCode}</p>
      <p style="margin:0;font-size:10px;color:#6B6B6B;">Tel: ${data.shippingAddress.phone}</p>
    </td>
  </tr>

  <!-- Track CTA -->
  <tr>
    <td style="padding:28px 40px 32px;text-align:center;">
      <p style="margin:0 0 16px;font-size:10px;color:#9B9B9B;letter-spacing:0.08em;">You can track your order anytime at</p>
      <a href="https://freert.in/track-order" style="display:inline-block;background:#1A1A1A;color:#FDFAF6;text-decoration:none;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;">Track My Order</a>
    </td>
  </tr>
  `;

  return baseWrapper(body);
}

// ─────────────────────────────────────────────
// 2. ORDER CANCELLATION EMAIL
// ─────────────────────────────────────────────
export function orderCancellationTemplate(data: {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  items: { name: string; size: string; color: string; qty: number; price: number }[];
  total: number;
  reason?: string;
}): string {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F0EBE3;">
        <p style="margin:0 0 2px;font-size:11px;color:#1A1A1A;">${item.name}</p>
        <p style="margin:0;font-size:9px;color:#9B9B9B;text-transform:uppercase;letter-spacing:0.08em;">Size: ${item.size} · Colour: ${item.color} · Qty: ${item.qty}</p>
      </td>
      <td style="padding:10px 0 10px 16px;border-bottom:1px solid #F0EBE3;text-align:right;">
        <p style="margin:0;font-size:11px;color:#1A1A1A;">₹${(item.price * item.qty).toLocaleString('en-IN')}</p>
      </td>
    </tr>
  `).join('');

  const body = `
  <tr>
    <td style="padding:32px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDF5F5;border:1px solid #E8D0D0;padding:16px 20px;">
        <tr>
          <td>
            <p style="margin:0 0 4px;font-size:8px;letter-spacing:0.2em;color:#8B2020;text-transform:uppercase;">Order Cancelled</p>
            <p style="margin:0;font-size:16px;font-weight:300;color:#1A1A1A;letter-spacing:0.05em;">${data.orderNumber}</p>
          </td>
          <td align="right">
            <p style="margin:0;font-size:9px;color:#9B9B9B;">${data.orderDate}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:24px 40px 0;">
      <p style="margin:0 0 6px;font-size:14px;font-weight:300;color:#1A1A1A;">We're sorry to inform you that your order has been cancelled.</p>
      <p style="margin:0;font-size:10px;color:#9B9B9B;line-height:1.6;">${data.reason || 'Your order has been cancelled by our team. If you believe this is a mistake or have any questions, please contact us immediately.'}</p>
    </td>
  </tr>

  <tr>
    <td style="padding:20px 40px 0;">
      <p style="margin:0 0 10px;font-size:8px;letter-spacing:0.2em;color:#9B9B9B;text-transform:uppercase;border-bottom:1px solid #E8E0D6;padding-bottom:8px;">Cancelled Items</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemRows}
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:20px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8E0D6;padding-top:10px;">
        <tr>
          <td style="font-size:11px;font-weight:500;color:#1A1A1A;padding-top:10px;">Order Total</td>
          <td style="font-size:11px;font-weight:500;color:#1A1A1A;text-align:right;padding-top:10px;">₹${data.total.toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:24px 40px 32px;text-align:center;">
      <p style="margin:0 0 6px;font-size:10px;color:#6B6B6B;">If you paid online, your refund will be processed within 5–7 business days.</p>
      <p style="margin:0 0 20px;font-size:10px;color:#6B6B6B;">To dispute this cancellation or place a new order, contact us:</p>
      <a href="mailto:freertofficial@gmail.com" style="display:inline-block;border:1px solid #1A1A1A;color:#1A1A1A;text-decoration:none;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;padding:12px 28px;">Contact Support</a>
    </td>
  </tr>
  `;

  return baseWrapper(body);
}

// ─────────────────────────────────────────────
// 3. OTP EMAIL (Signup & Password Reset)
// ─────────────────────────────────────────────
export function otpEmailTemplate(otp: string, purpose: 'signup' | 'reset_password', customerName?: string): string {
  const title = purpose === 'signup' ? 'Verify Your Account' : 'Password Reset Verification';
  const subtitle = purpose === 'signup'
    ? 'Enter this code to complete your FREERT account setup.'
    : 'Enter this code to reset your account password.';

  const body = `
  <tr>
    <td style="padding:36px 40px 0;text-align:center;">
      <p style="margin:0 0 6px;font-size:16px;font-weight:300;color:#1A1A1A;letter-spacing:0.05em;">${title}</p>
      ${customerName ? `<p style="margin:0 0 6px;font-size:11px;color:#6B6B6B;">Hello, ${customerName}</p>` : ''}
      <p style="margin:0;font-size:10px;color:#9B9B9B;letter-spacing:0.08em;">${subtitle}</p>
    </td>
  </tr>

  <!-- OTP Block -->
  <tr>
    <td style="padding:28px 40px;text-align:center;">
      <table align="center" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#1A1A1A;padding:20px 40px;">
            <p style="margin:0 0 4px;font-size:8px;letter-spacing:0.25em;color:#9B9B9B;text-transform:uppercase;">Your Verification Code</p>
            <p style="margin:0;font-size:36px;font-weight:300;color:#FDFAF6;letter-spacing:0.5em;font-family:'Courier New',monospace;">${otp}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:0 40px 32px;text-align:center;">
      <p style="margin:0 0 6px;font-size:10px;color:#C8A96E;letter-spacing:0.08em;">⏱ This code is valid for <strong>10 minutes</strong> only.</p>
      <p style="margin:0;font-size:9px;color:#B0B0B0;line-height:1.6;">If you did not request this code, please ignore this email.<br/>Do not share this code with anyone.</p>
    </td>
  </tr>
  `;

  return baseWrapper(body);
}

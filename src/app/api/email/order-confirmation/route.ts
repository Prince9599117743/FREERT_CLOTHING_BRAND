import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTransactionalEmail } from '@/lib/brevo';
import { orderConfirmationTemplate, OrderEmailData } from '@/lib/email-templates';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getCleanOrderNumber(uuid: string): string {
  if (!uuid) return '#000000';
  if (/^\d+$/.test(uuid)) return `#${uuid}`;
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `#${10000 + Math.abs(hash % 90000)}`;
}

export async function POST(request: Request) {
  try {
    const { orderId, customerEmail, customerName } = await request.json();
    if (!orderId || !customerEmail) {
      return NextResponse.json({ error: 'orderId and customerEmail are required.' }, { status: 400 });
    }

    // Fetch full order with items and payments from DB
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(name, images, slug),
          variant:product_variants(size, color)
        ),
        payment:payments(*)
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const orderDate = new Date(order.created_at).toLocaleString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Asia/Kolkata'
    });

    const items = (order.items || []).map((item: any) => ({
      name: item.product?.name || item.variant?.product?.name || 'FREERT Garment',
      size: item.variant?.size || 'One Size',
      color: item.variant?.color || 'Default',
      qty: item.qty || 1,
      price: item.unit_price || 0,
      image: item.product?.images?.[0] || null
    }));

    const rawPayment = order.payment?.[0];
    const paymentMethodLabel = (rawPayment?.provider === 'cod') 
      ? 'Cash on Delivery' 
      : 'Online Payment (Razorpay)';

    const emailData: OrderEmailData = {
      orderId: order.id,
      orderNumber: getCleanOrderNumber(order.id),
      orderDate,
      customerName: customerName || order.shipping_name || 'Valued Customer',
      customerEmail,
      customerPhone: order.shipping_phone || '',
      items,
      subtotal: (order.total_amount || 0) + (order.discount_amount || 0),
      discount: order.discount_amount || 0,
      total: order.total_amount || 0,
      paymentMethod: paymentMethodLabel,
      shippingAddress: {
        fullName: order.shipping_name || customerName || 'Customer',
        street: order.shipping_street || '',
        city: order.shipping_city || '',
        state: order.shipping_state || '',
        postalCode: order.shipping_postal_code || '',
        phone: order.shipping_phone || ''
      }
    };

    const html = orderConfirmationTemplate(emailData);

    const result = await sendTransactionalEmail({
      to: [{ email: customerEmail, name: emailData.customerName }],
      subject: `Order Confirmed ${emailData.orderNumber} — FREERT`,
      htmlContent: html
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderNumber: emailData.orderNumber });

  } catch (err: any) {
    console.error('[Email/OrderConfirmation] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

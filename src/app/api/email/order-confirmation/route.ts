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

    // Fetch full order with items from DB
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(name, images, slug),
          variant:product_variants(size, color)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const shippingAddr = order.shipping_address || {};
    const orderDate = new Date(order.created_at).toLocaleString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Asia/Kolkata'
    });

    const items = (order.items || []).map((item: any) => ({
      name: item.product?.name || item.variant?.product?.name || 'FREERT Garment',
      size: item.variant?.size || 'One Size',
      color: item.variant?.color || 'Default',
      qty: item.quantity || item.qty || 1,
      price: item.unit_price || item.price || 0,
      image: item.product?.images?.[0] || null
    }));

    const emailData: OrderEmailData = {
      orderId: order.id,
      orderNumber: getCleanOrderNumber(order.id),
      orderDate,
      customerName: customerName || shippingAddr.fullName || shippingAddr.full_name || 'Valued Customer',
      customerEmail,
      customerPhone: shippingAddr.phone || '',
      items,
      subtotal: (order.total_amount || 0) + (order.discount_amount || 0),
      discount: order.discount_amount || 0,
      total: order.total_amount || 0,
      paymentMethod: order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)',
      shippingAddress: {
        fullName: shippingAddr.fullName || shippingAddr.full_name || customerName || 'Customer',
        street: shippingAddr.street || shippingAddr.address || '',
        city: shippingAddr.city || '',
        state: shippingAddr.state || '',
        postalCode: shippingAddr.postalCode || shippingAddr.postal_code || '',
        phone: shippingAddr.phone || ''
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

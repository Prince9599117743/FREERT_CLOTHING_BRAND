import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTransactionalEmail } from '@/lib/brevo';
import { orderCancellationTemplate } from '@/lib/email-templates';

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
    const { orderId, reason } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
    }

    // Fetch order with items
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users(email, full_name),
        items:order_items(
          *,
          product:products(name, images),
          variant:product_variants(size, color)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const customerEmail = order.user?.email || order.shipping_address?.email;
    const customerName = order.user?.full_name || order.shipping_address?.fullName || 'Valued Customer';

    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email not found for this order.' }, { status: 400 });
    }

    const orderDate = new Date(order.created_at).toLocaleString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    const items = (order.items || []).map((item: any) => ({
      name: item.product?.name || 'FREERT Garment',
      size: item.variant?.size || 'One Size',
      color: item.variant?.color || 'Default',
      qty: item.quantity || item.qty || 1,
      price: item.unit_price || item.price || 0
    }));

    const html = orderCancellationTemplate({
      orderNumber: getCleanOrderNumber(order.id),
      orderDate,
      customerName,
      items,
      total: order.total_amount || 0,
      reason: reason || undefined
    });

    const result = await sendTransactionalEmail({
      to: [{ email: customerEmail, name: customerName }],
      subject: `Order Cancellation Notice ${getCleanOrderNumber(order.id)} — FREERT`,
      htmlContent: html
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('[Email/OrderCancellation] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
    const { orderId, customerEmail, customerName, paymentMethod } = await request.json();
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

    // Server-side self-healing: if no payment record exists, insert it using admin client
    let paymentsList = order.payment || [];
    if (paymentsList.length === 0) {
      const selectedProvider = paymentMethod || 'cod';
      const { data: newPayment, error: payInsertError } = await supabaseAdmin
        .from('payments')
        .insert({
          order_id: order.id,
          provider: selectedProvider,
          status: selectedProvider === 'cod' ? 'pending' : 'completed',
          amount: order.total_amount
        })
        .select();

      if (!payInsertError && newPayment) {
        paymentsList = newPayment;
      } else if (payInsertError) {
        console.error('[Email/OrderConfirmation] Self-healing payment creation failed:', payInsertError.message);
      }
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

    const rawPayment = paymentsList[0];
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

    // Send instant alert email copy to admin (freertofficial@gmail.com)
    await sendTransactionalEmail({
      to: [{ email: 'freertofficial@gmail.com', name: 'FREERT Admin' }],
      subject: `[NEW ORDER] ${emailData.orderNumber} — ${emailData.customerName}`,
      htmlContent: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e8e0d6; background-color: #fdfaf6; max-width: 600px; margin-bottom: 30px;">
          <h2 style="color: #1a1a1a; font-weight: 300; border-bottom: 1px solid #e8e0d6; padding-bottom: 10px; margin-top: 0; letter-spacing: 0.1em; text-transform: uppercase; font-size: 16px;">New Order Alert</h2>
          <p style="font-size: 12px; color: #6b6b6b;">An order was successfully placed by a customer. Below are the packing and coordinates details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; color: #1a1a1a;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #f0ebe3; width: 30%;">Order ID:</td>
              <td style="padding: 6px 0; border-bottom: 1px solid #f0ebe3; font-family: monospace; font-size: 12px;">${emailData.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #f0ebe3;">Customer Name:</td>
              <td style="padding: 6px 0; border-bottom: 1px solid #f0ebe3;">${emailData.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #f0ebe3;">Phone Number:</td>
              <td style="padding: 6px 0; border-bottom: 1px solid #f0ebe3;">${emailData.customerPhone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #f0ebe3;">Payment Method:</td>
              <td style="padding: 6px 0; border-bottom: 1px solid #f0ebe3; font-weight: bold; color: #c8a96e;">${emailData.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #f0ebe3; vertical-align: top;">Shipping Address:</td>
              <td style="padding: 6px 0; border-bottom: 1px solid #f0ebe3; line-height: 1.4;">
                ${emailData.shippingAddress.street}<br/>
                ${emailData.shippingAddress.city}, ${emailData.shippingAddress.state} — ${emailData.shippingAddress.postalCode}
              </td>
            </tr>
          </table>
        </div>
        ${html}
      `
    }).catch((e) => console.error('[AdminEmailAlert] Failed:', e.message));

    return NextResponse.json({ success: true, orderNumber: emailData.orderNumber });

  } catch (err: any) {
    console.error('[Email/OrderConfirmation] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

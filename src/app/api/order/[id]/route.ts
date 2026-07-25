import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await props.params;
    const orderId = resolvedParams.id;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const selectQuery = `
      *,
      user:users(id, email, full_name, phone),
      items:order_items(
        *,
        product:products(*),
        variant:product_variants(*, product:products(*))
      ),
      payment:payments(*)
    `;

    // 1. If it's a valid UUID, fetch directly
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(orderId)) {
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select(selectQuery)
        .eq('id', orderId)
        .maybeSingle();

      if (error) throw error;
      return NextResponse.json(order);
    } else {
      // 2. Fallback: match clean hashed order number
      const { data: allOrders, error } = await supabaseAdmin
        .from('orders')
        .select(selectQuery);

      if (error) throw error;

      const found = allOrders?.find(o => {
        let hash = 0;
        for (let i = 0; i < o.id.length; i++) {
          hash = o.id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const cleanNo = (10000 + Math.abs(hash % 90000)).toString();
        return cleanNo === orderId.replace('#', '');
      });

      return NextResponse.json(found || null);
    }
  } catch (err: any) {
    console.error('[API/GetOrder] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    const { productId, variantId, userId, email } = await request.json();
    if (!productId || !email) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from('restock_alerts').insert({
      product_id: productId,
      variant_id: variantId || null,
      user_id: userId || null,
      email: email
    }).select().single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('API Restock Alert Error:', error);
    return NextResponse.json(
      { error: 'Failed to register restock request', details: error.message },
      { status: 500 }
    );
  }
}

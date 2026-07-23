const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function run() {
  console.log('Querying columns of public.products table...');
  const { data, error } = await supabaseAdmin.rpc('get_products_columns_info');
  
  // If RPC doesn't exist (likely), let's just select a single product and dump keys,
  // or query pg_attribute / information_schema via RPC if possible.
  // Since we cannot run raw SQL directly, let's select all fields of one row
  const { data: products, error: selectError } = await supabaseAdmin.from('products').select('*').limit(1);
  if (selectError) {
    console.error('Select failed:', selectError);
  } else {
    console.log('Product columns found:', products.length > 0 ? Object.keys(products[0]) : 'No products exist yet');
    if (products.length > 0) {
      console.log('Full product object keys:', Object.keys(products[0]));
    }
  }
}

run();

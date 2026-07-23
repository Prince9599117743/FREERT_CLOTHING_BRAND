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
  const { data: products, error: pError } = await supabaseAdmin.from('products').select('id, name');
  if (pError) console.error('Products fetch error:', pError);
  else console.log(`Total products count: ${products.length}`);

  const { data: variants, error: vError } = await supabaseAdmin.from('product_variants').select('id, product_id, size, color');
  if (vError) console.error('Variants fetch error:', vError);
  else console.log(`Total variants count: ${variants.length}`);

  const { data: wishlist, error: wError } = await supabaseAdmin.from('wishlist').select('id');
  if (wError) console.error('Wishlist fetch error:', wError);
  else console.log(`Total wishlist count: ${wishlist.length}`);
}

run();

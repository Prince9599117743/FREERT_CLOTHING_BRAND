const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local file not found!');
  process.exit(1);
}

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

if (!supabaseUrl || !serviceKey) {
  console.error('Supabase URL or Service Role Key missing in .env.local!');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function run() {
  console.log('Fetching all products...');
  const { data: products, error: pError } = await supabaseAdmin.from('products').select('*');
  if (pError) {
    console.error('Failed to fetch products:', pError);
    process.exit(1);
  }

  console.log(`Found ${products.length} products. Checking variants...`);

  for (const product of products) {
    const { data: variants, error: vError } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id);

    if (vError) {
      console.error(`Failed to fetch variants for product ${product.name}:`, vError);
      continue;
    }

    if (variants.length === 0) {
      console.log(`Product "${product.name}" has 0 variants. Creating default...`);
      const defaultVariant = {
        product_id: product.id,
        size: 'One Size',
        color: 'Default',
        sku: `SKU-${product.slug}-${Math.floor(100000 + Math.random() * 900000)}`,
        stock_qty: product.stock_qty || 10,
        additional_price: 0.00
      };

      const { data: created, error: createError } = await supabaseAdmin
        .from('product_variants')
        .insert(defaultVariant)
        .select()
        .single();

      if (createError) {
        console.error(`Failed to create default variant for product ${product.name}:`, createError);
      } else {
        console.log(`Successfully created default variant for product ${product.name} with SKU: ${created.sku}`);
      }
    } else {
      console.log(`Product "${product.name}" already has ${variants.length} variant(s). Skipping.`);
    }
  }

  console.log('Seeding finished successfully.');
}

run();

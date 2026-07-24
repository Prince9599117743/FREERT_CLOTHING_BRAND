const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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
  console.log('Fetching products and categories...');
  const { data: products } = await supabaseAdmin.from('products').select('name, parent_category, sub_category').limit(10);
  const { data: categories } = await supabaseAdmin.from('categories').select('name, slug, parent_category').limit(20);
  console.log('Sample Products:', products);
  console.log('Sample Categories:', categories);
}
run();

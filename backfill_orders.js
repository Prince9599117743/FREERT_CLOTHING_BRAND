const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  });
} catch (e) {
  console.error("Failed to read env.local:", e);
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env keys!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfill() {
  console.log("Fetching orders...");
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Fetch error:", error);
    return;
  }

  console.log(`Found ${orders.length} total orders.`);
  
  let currentNum = 1001;
  for (const order of orders) {
    if (!order.order_number) {
      console.log(`Updating order ${order.id} with number ${currentNum}...`);
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ order_number: currentNum })
        .eq('id', order.id);
      
      if (updateErr) {
        console.error(`Failed to update ${order.id}:`, updateErr);
      }
      currentNum++;
    } else {
      if (order.order_number >= currentNum) {
        currentNum = order.order_number + 1;
      }
    }
  }

  console.log("Backfill complete!");
}

backfill();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, total_amount')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Order Fetch Error:', error);
    return;
  }
  
  console.log('Orders:', JSON.stringify(data, null, 2));
}

test();

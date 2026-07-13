const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, count, error } = await supabase
    .from('order_items')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Fetch Error:', error);
    return;
  }
  
  console.log(`Total Order Items count: ${count}`);
  
  // also check order items for the newest order
  const { data: newOrderItems, error: newError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', '1ad47dd3-4637-4ba3-ab89-4e5733d35856');
    
  console.log('Items for order 1ad47dd3-4637-4ba3-ab89-4e5733d35856:', newOrderItems);
}

test();

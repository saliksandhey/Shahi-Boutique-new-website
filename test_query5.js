const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from('order_items')
    .insert({
      order_id: '1ad47dd3-4637-4ba3-ab89-4e5733d35856',
      product_id: null,
      variant_id: null,
      price: 0,
      quantity: 1
    });

  console.log('Error:', error);
}

test();

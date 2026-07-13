const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Order Fetch Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    const orderId = data[0].id;
    console.log('Order ID:', orderId);
    
    const { data: items, error: itemError } = await supabase
      .from('order_items')
      .select(`
        id, quantity, price, refunded_quantity,
        product_id,
        products(name, slug, product_images(url, position))
      `)
      .eq('order_id', orderId);
      
    if (itemError) {
      console.error('Items Fetch Error:', itemError);
    } else {
      console.log('Items Data:', JSON.stringify(items, null, 2));
    }
  } else {
    console.log('No orders found.');
  }
}

test();

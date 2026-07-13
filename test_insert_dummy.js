const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, price')
    .limit(1)
    .single();

  if (error) {
    console.error('Fetch Error:', error);
    return;
  }
  
  if (product) {
    console.log('Inserting order item for product:', product.name);
    const { error: insertError } = await supabase
      .from('order_items')
      .insert({
        order_id: '1ad47dd3-4637-4ba3-ab89-4e5733d35856',
        product_id: product.id,
        price: 999, // Matching the subtotal in the screenshot
        quantity: 1
      });
      
    if (insertError) {
      console.error('Insert error:', insertError);
    } else {
      console.log('Successfully inserted dummy order item!');
    }
  } else {
    console.log('No products found.');
  }
}

test();

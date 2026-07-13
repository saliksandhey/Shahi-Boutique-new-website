const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixPastOrders() {
  // Get one product to use as dummy
  const { data: product } = await supabase
    .from('products')
    .select('id, name, price')
    .limit(1)
    .single();

  if (!product) {
    console.log("No products found in DB to use as a fallback.");
    return;
  }

  // Fetch all orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, total_amount, subtotal');

  if (error) {
    console.error("Error fetching orders:", error);
    return;
  }

  let fixedCount = 0;

  for (const order of orders) {
    // Check if this order has items
    const { data: items } = await supabase
      .from('order_items')
      .select('id')
      .eq('order_id', order.id);

    if (items && items.length === 0) {
      // Order has no items because of the previous bug! Insert a dummy item.
      const priceToUse = order.subtotal || order.total_amount || product.price;
      
      const { error: insertErr } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: product.id,
          price: priceToUse,
          quantity: 1
        });

      if (!insertErr) {
        fixedCount++;
      }
    }
  }

  console.log(`Successfully fixed ${fixedCount} past orders by injecting a placeholder item.`);
}

fixPastOrders();

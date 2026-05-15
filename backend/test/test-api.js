
async function test() {
  const API_URL = 'http://localhost:3003';
  try {
    console.log('--- Testing Inventory ---');
    const invRes = await fetch(`${API_URL}/inventory`);
    const invData = await invRes.json();
    if (!invData.data || !invData.data.items.length) {
        console.error('No inventory items found.');
        return;
    }
    const variantId = invData.data.items[0].variantId;
    console.log('Using VariantID:', variantId);

    console.log('\n--- Testing Cart (Add Item) ---');
    const addRes = await fetch(`${API_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId, quantity: 2 })
    });
    const addData = await addRes.json();
    console.log('Add Response:', addData.status);

    console.log('\n--- Testing Cart (View) ---');
    const cartRes = await fetch(`${API_URL}/cart`);
    const cartData = await cartRes.json();
    console.log('Cart Items:', cartData.data.items?.length || 0);

    console.log('\n--- Testing Order (Create) ---');
    const orderRes = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shippingAddress: '123 Test St',
        phone: '0912345678',
        note: 'Test order'
      })
    });
    const orderData = await orderRes.json();
    if (orderData.status === 'error') {
        console.error('Order Error:', orderData.message);
        return;
    }
    console.log('Order Created ID:', orderData.data.id);

    console.log('\n--- Verifying Inventory Deduction ---');
    const invAfterRes = await fetch(`${API_URL}/inventory`);
    const invAfterData = await invAfterRes.json();
    const itemAfter = invAfterData.data.items.find((i) => i.variantId === variantId);
    console.log('Inventory Reserved:', itemAfter.reserved);

    if (itemAfter.reserved >= 2) {
      console.log('\n✅ SUCCESS: API logic verified!');
    } else {
      console.log('\n❌ FAILURE: API logic mismatch!');
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();

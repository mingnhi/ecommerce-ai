import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { CART_CONSTANTS } from '@/shared/constants';
import { useCartStore } from '../store';
import {
  useCartQuery,
  useRemoveFromCart,
  useUpdateQuantity,
  useClearCart
} from '../hooks';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/shared/components/common/LoadingScreen';

export function CartPage() {
  const navigate = useNavigate();

  // Local state (Zustand)
  const {
    items: localItems,
    isLoading: localLoading,
    error: localError,
    removeItem: removeLocalItem,
    updateQuantity: updateLocalQuantity,
    clearCart: clearLocalCart,
    openCheckout,
    setLoading,
    setError,
    getTotal,
    getItemCount,
  } = useCartStore();

  // Server state (React Query)
  const { data: serverCart, isLoading: serverLoading, error: serverError } = useCartQuery();
  
  // API mutations
  const removeFromCartMutation = useRemoveFromCart();
  const updateQuantityMutation = useUpdateQuantity();
  const clearCartMutation = useClearCart();

  // Use server data if available, otherwise use local state
  const items = serverCart?.items || localItems;
  const total = serverCart?.total || getTotal();
  const isLoading = serverLoading || localLoading;
  const error = serverError || localError;

  // Combined actions
  const removeItem = async (itemId: string) => {
    try {
      setLoading(true);
      await removeFromCartMutation.mutateAsync(itemId);
      removeLocalItem(itemId);
      setError(null);
    } catch (err) {
      setError('Failed to remove item from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      setLoading(true);
      await updateQuantityMutation.mutateAsync({ itemId, quantity });
      updateLocalQuantity(itemId, quantity);
      setError(null);
    } catch (err) {
      setError('Failed to update quantity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearAllItems = async () => {
    try {
      setLoading(true);
      await clearCartMutation.mutateAsync();
      clearLocalCart();
      setError(null);
    } catch (err) {
      setError('Failed to clear cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Đang tải giỏ hàng" description="Vui lòng chờ..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-red-600 text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600">{typeof error === 'string' ? error : 'An error occurred'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEmpty = items.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {isEmpty ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({getItemCount()})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading}
                          >
                            +
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({getItemCount()} items)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(total * CART_CONSTANTS.TAX_RATE).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{total > CART_CONSTANTS.FREE_SHIPPING_THRESHOLD ? 'FREE' : CART_CONSTANTS.SHIPPING_COST_DISPLAY}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${(total * (1 + CART_CONSTANTS.TAX_RATE) + (total > CART_CONSTANTS.FREE_SHIPPING_THRESHOLD ? 0 : CART_CONSTANTS.SHIPPING_COST)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={openCheckout}
                    className="w-full" 
                    size="lg"
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <Button
                    onClick={clearAllItems}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    Clear Cart
                  </Button>
                </div>

                {total <= CART_CONSTANTS.FREE_SHIPPING_THRESHOLD && (
                  <p className="text-sm text-gray-600 text-center">
                    Add ${(CART_CONSTANTS.FREE_SHIPPING_THRESHOLD - total).toFixed(2)} more for free shipping!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

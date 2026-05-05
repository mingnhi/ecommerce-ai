import { create } from 'zustand';
import type { CartState, CartItem } from './types';

interface CartStore extends CartState {
    // Actions
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    openCheckout: () => void;
    closeCheckout: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Computed values
    getTotal: () => number;
    getItemCount: () => number;
    getItemById: (id: string) => CartItem | undefined;
}

export const useCartStore = create<CartStore>((set, get) => ({
    // Initial state
    items: [],
    isCheckoutOpen: false,
    isLoading: false,
    error: null,

    // Actions
    addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.id === item.id);

        if (existingItem) {
            return {
                items: state.items.map((i) =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                ),
            };
        }

        return {
            items: [...state.items, item],
        };
    }),

    removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
    })),

    updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
        ),
    })),

    clearCart: () => set({
        items: [],
        error: null,
    }),

    openCheckout: () => set({ isCheckoutOpen: true }),
    closeCheckout: () => set({ isCheckoutOpen: false }),

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // Computed values
    getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    },

    getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
    },

    getItemById: (id) => {
        const { items } = get();
        return items.find((item) => item.id === id);
    },
}));
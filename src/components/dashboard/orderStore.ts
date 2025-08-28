import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

interface OrderState {
  cart: CartItem[];
  currentOrder: any;
  orders: any[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setCurrentOrder: (order: any) => void;
  addOrder: (order: any) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  cart: [],
  currentOrder: null,
  orders: [],
  
  addToCart: (item: CartItem) => {
    const cart = get().cart;
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      set({
        cart: cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        )
      });
    } else {
      set({ cart: [...cart, item] });
    }
  },
  
  removeFromCart: (itemId: string) => {
    set({
      cart: get().cart.filter(item => item.id !== itemId)
    });
  },
  
  updateQuantity: (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(itemId);
      return;
    }
    
    set({
      cart: get().cart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    });
  },
  
  clearCart: () => {
    set({ cart: [] });
  },
  
  setCurrentOrder: (order: any) => {
    set({ currentOrder: order });
  },
  
  addOrder: (order: any) => {
    set({ orders: [...get().orders, order] });
  },
}));

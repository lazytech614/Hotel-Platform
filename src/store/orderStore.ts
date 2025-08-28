import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  hotelId?: string;
  hotelName?: string;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderId: string;
  items: CartItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  estimatedDeliveryTime?: string;
  deliveryAddress?: string;
  paymentStatus: string;
  paymentMethod: string;
}

interface OrderState {
  cart: CartItem[];
  currentOrder: Order | null;
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  
  // Cart actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  
  // Order actions
  setCurrentOrder: (order: Order | null) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  setOrders: (orders: Order[]) => void;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      cart: [],
      currentOrder: null,
      orders: [],
      isLoading: false,
      error: null,
      
      // Cart actions
      addToCart: (item: CartItem) => {
        const cart = get().cart;
        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
        
        if (existingItemIndex > -1) {
          // Update existing item quantity
          const updatedCart = [...cart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity + (item.quantity || 1)
          };
          set({ cart: updatedCart });
        } else {
          // Add new item
          set({ cart: [...cart, { ...item, quantity: item.quantity || 1 }] });
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
      
      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getCartItemCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
      
      // Order actions
      setCurrentOrder: (order: Order | null) => {
        set({ currentOrder: order });
      },
      
      addOrder: (order: Order) => {
        set({ orders: [order, ...get().orders] });
      },
      
      updateOrderStatus: (orderId: string, status: string) => {
        set({
          orders: get().orders.map(order =>
            order.orderId === orderId ? { ...order, status } : order
          )
        });
        
        // Update current order if it matches
        const currentOrder = get().currentOrder;
        if (currentOrder && currentOrder.orderId === orderId) {
          set({ currentOrder: { ...currentOrder, status } });
        }
      },
      
      setOrders: (orders: Order[]) => {
        set({ orders });
      },
      
      // State management
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
        currentOrder: state.currentOrder,
      }),
    }
  )
);

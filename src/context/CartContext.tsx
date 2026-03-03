import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Product, Variant, Addon } from "@/lib/menu-data";

export interface CartItem {
  id: string;
  product: Product;
  variant: Variant;
  addons: Addon[];
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; variant: Variant; addons: Addon[] } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "TOGGLE_CART" }
  | { type: "CLOSE_CART" }
  | { type: "CLEAR_CART" };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  totalItems: number;
  totalAmount: number;
  deliveryCharge: number;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, variant, addons } = action.payload;
      const itemId = `${product.id}-${variant.id}-${addons.map(a => a.id).sort().join(",")}`;
      const existing = state.items.find((i) => i.id === itemId);
      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...state,
        isOpen: true,
        items: [...state.items, { id: itemId, product, variant, addons, quantity: 1 }],
      };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        ),
      };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "CLEAR_CART":
      return { ...state, items: [], isOpen: false };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryCharge = 30;
  const totalAmount = state.items.reduce((sum, item) => {
    const addonTotal = item.addons.reduce((s, a) => s + a.price, 0);
    return sum + (item.variant.price + addonTotal) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ state, dispatch, totalItems, totalAmount, deliveryCharge }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

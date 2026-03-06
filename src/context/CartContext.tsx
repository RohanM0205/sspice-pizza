import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

/* =========================
   🔥 Lightweight Cart Types
========================= */

export interface CartProduct {
  id: string;
  name: string;
  image: string;
}

export interface CartVariant {
  id: string;
  name: string;
  price: number;
}

export interface CartAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  product: CartProduct;
  variant: CartVariant;
  addons: CartAddon[];
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "SET_ITEMS"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "TOGGLE_CART" }
  | { type: "CLOSE_CART" }
  | { type: "CLEAR_CART" };

const CartContext = createContext<any>(null);

/* =========================
   🔥 Reducer
========================= */

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload };

    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.payload.id);

      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }

      return {
        ...state,
        isOpen: true,
        items: [...state.items, action.payload],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      };

    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== action.payload.id),
        };
      }

      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };

    case "CLOSE_CART":
      return { ...state, isOpen: false };

    case "CLEAR_CART":
      return { items: [], isOpen: false };

    default:
      return state;
  }
}

/* =========================
   🔥 Provider
========================= */

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    cartReducer,
    { items: [], isOpen: false },
    (initial) => {
      const stored = localStorage.getItem("sspice-cart");
  
      if (!stored) return initial;
  
      try {
        const parsed = JSON.parse(stored);
  
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
        const invalidItem = parsed.items?.some(
          (i: any) =>
            !uuidRegex.test(i?.product?.id ?? "") ||
            !uuidRegex.test(i?.variant?.id ?? "")
        );
  
        if (invalidItem) {
          console.warn("Invalid cart detected. Clearing old cart.");
          localStorage.removeItem("sspice-cart");
          return initial;
        }
  
        return parsed;
      } catch {
        localStorage.removeItem("sspice-cart");
        return initial;
      }
    }
  );

  const [customerId, setCustomerId] = useState<string | null>(null);

  /* =========================
     🔥 Persist Guest Cart
  ========================= */

  useEffect(() => {
    localStorage.setItem("sspice-cart", JSON.stringify(state));
  }, [state]);

  /* =========================
     🔥 Cart Expiration (2hrs)
  ========================= */

  useEffect(() => {
    const storedTime = localStorage.getItem("sspice-cart-time");
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;

    if (!storedTime) {
      localStorage.setItem("sspice-cart-time", now.toString());
      return;
    }

    if (now - parseInt(storedTime) > twoHours) {
      dispatch({ type: "CLEAR_CART" });
      localStorage.removeItem("sspice-cart-time");
    }
  }, []);

  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem("sspice-cart-time", Date.now().toString());
    }
  }, [state.items]);

  /* =========================
     🔥 Merge Logic
  ========================= */

  const mergeCarts = (guest: CartItem[], db: CartItem[]): CartItem[] => {
    const map = new Map<string, CartItem>();

    [...db, ...guest].forEach((item) => {
      if (map.has(item.id)) {
        map.get(item.id)!.quantity += item.quantity;
      } else {
        map.set(item.id, { ...item });
      }
    });

    return Array.from(map.values());
  };

  /* =========================
     🔥 Fetch Cart From DB
  ========================= */

  const fetchCartFromDB = async (
    customerId: string
  ): Promise<CartItem[]> => {
    const { data: cart } = await supabase
      .from("carts")
      .select("*")
      .eq("customer_id", customerId)
      .eq("is_active", true)
      .maybeSingle();

    if (!cart) return [];

    const { data: items } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        product:products(*),
        variant:product_variants(*),
        cart_item_addons(
          addon:product_addons(*)
        )
      `
      )
      .eq("cart_id", cart.id);

    if (!items) return [];

    return items.map((item: any) => {
      const addonIds =
        item.cart_item_addons?.map((a: any) => a.addon.id) ?? [];

      return {
        id: `${item.product_id}_${item.variant_id}_${addonIds
          .sort()
          .join("|")}`,
        product: {
          id: item.product.id,
          name: item.product.name,
          image: item.product.image_url,
        },
        variant: {
          id: item.variant.id,
          name: item.variant.variant_name,
          price: item.variant.price,
        },
        addons:
          item.cart_item_addons?.map((a: any) => ({
            id: a.addon.id,
            name: a.addon.name,
            price: a.addon.price,
          })) ?? [],
        quantity: item.quantity,
      };
    });
  };

  /* =========================
     🔥 Optimized Sync
  ========================= */

  const optimizedSyncCart = async (
    customerId: string,
    items: CartItem[]
  ) => {
    let { data: cart } = await supabase
      .from("carts")
      .select("*")
      .eq("customer_id", customerId)
      .eq("is_active", true)
      .maybeSingle();

    if (!cart) {
      const { data: newCart } = await supabase
        .from("carts")
        .insert({ customer_id: customerId })
        .select()
        .maybeSingle();
      cart = newCart;
    }

    const { data: existingItems } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id);

    const existingMap = new Map(
      existingItems?.map((i: any) => [
        `${i.product_id}_${i.variant_id}`,
        i,
      ]) ?? []
    );

    for (const item of items) {
      const key = `${item.product.id}_${item.variant.id}`;
      const existing = existingMap.get(key);

      if (existing) {
        if (existing.quantity !== item.quantity) {
          await supabase
            .from("cart_items")
            .update({ quantity: item.quantity })
            .eq("id", existing.id);
        }
      } else {
        const { data: newItem, error } = await supabase
  .from("cart_items")
  .insert({
    cart_id: cart.id,
    product_id: String(item.product.id),
    variant_id: String(item.variant.id),
    quantity: item.quantity,
    price: item.variant.price,
  })
  .select()
  .maybeSingle();

if (error || !newItem) {
  console.error("Cart item insert failed:", error);
  continue;
}

        for (const addon of item.addons) {
          await supabase.from("cart_item_addons").insert({
            cart_item_id: newItem.id,
            addon_id: addon.id,
            price: addon.price,
          });
        }
      }
    }
  };

  /* =========================
     🔥 Init Auth + Merge
  ========================= */

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("auth_user_id", data.user.id)
        .maybeSingle();

      if (!customer) return;

      setCustomerId(customer.id);

      const dbItems = await fetchCartFromDB(customer.id);

      if (state.items.length > 0) {
        const merged = mergeCarts(state.items, dbItems);
        dispatch({ type: "SET_ITEMS", payload: merged });
        await optimizedSyncCart(customer.id, merged);
      } else {
        dispatch({ type: "SET_ITEMS", payload: dbItems });
      }
    };

    init();
  }, []);

  /* =========================
     🔥 Auto Sync
  ========================= */

  useEffect(() => {
    if (customerId) {
      optimizedSyncCart(customerId, state.items);
    }
  }, [state.items, customerId]);

  /* =========================
     🔥 Totals
  ========================= */

  const totalItems = state.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalAmount = state.items.reduce((sum, item) => {
    const variantPrice = Number(item.variant?.price ?? 0);
    const addonTotal = item.addons.reduce(
      (s, a) => s + Number(a.price ?? 0),
      0
    );
    const quantity = Number(item.quantity ?? 0);
  
    return sum + (variantPrice + addonTotal) * quantity;
  }, 0);

  const deliveryCharge = totalAmount > 499 ? 0 : 30;

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        totalItems,
        totalAmount,
        deliveryCharge,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the CartType
export type CartType = {
  available: boolean;
  category: string;
  description: string;
  item_id: string;
  name: string;
  price: number;
  time_to_prepare: number;
  type: string;
  quantity: number;
}[];

// Define the context's type
type EssentialCart = {
  cartEssentials: CartType;
  setCartEssentials: React.Dispatch<React.SetStateAction<CartType>>;
};

// Create the context with a default value
const CartContext = createContext<EssentialCart | undefined>(undefined);

// Create a provider component
export const EssentialsCartProvider = ({ children }: { children: ReactNode }) => {
  const [cartEssentials, setCartEssentials] = useState<CartType>([]);

  return (
    <CartContext.Provider value={{ cartEssentials, setCartEssentials }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the CartContext
export const useEssentialsCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useEssentialsCart must be used within an EssentialsCartProvider");
  }
  return context;
};

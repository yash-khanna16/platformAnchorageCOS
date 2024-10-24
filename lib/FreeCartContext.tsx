"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartType } from './CartContext';

// Define the FreeItemType
// export type FreeItemType = {
//   available: boolean;
//   category: string;
//   description: string;
//   item_id: string;
//   name: string;
//   time_to_prepare: number;
//   type: string;
//   qty: number;
// }[];

// Define the context's type
type FreeItemContextType = {
  freeItems: CartType;
  setFreeItems: React.Dispatch<React.SetStateAction<CartType>>;
};

// Create the context with a default value
const FreeItemContext = createContext<FreeItemContextType | undefined>(undefined);

// Create a provider component
export const FreeItemProvider = ({ children }: { children: ReactNode }) => {
  const [freeItems, setFreeItems] = useState<CartType>([]);

  return (
    <FreeItemContext.Provider value={{ freeItems, setFreeItems }}>
      {children}
    </FreeItemContext.Provider>
  );
};

// Custom hook to use the FreeItemContext
export const useFreeItems = () => {
  const context = useContext(FreeItemContext);
  if (!context) {
    throw new Error('useFreeItems must be used within a FreeItemProvider');
  }
  return context;
};

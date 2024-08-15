import { Suspense, useState } from "react";
import Navbar from "./Navbar";
import { CircularProgress } from "@mui/joy";
import { CartProvider } from "@/lib/CartContext";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <Suspense
        fallback={
          <div className="w-screen h-screen justify-center items-center">
            <CircularProgress />
          </div>
        }
      >
        <div className="mb-16">
          <div>{children}</div>
          <Navbar />
        </div>
      </Suspense>
    </CartProvider>
  );
}

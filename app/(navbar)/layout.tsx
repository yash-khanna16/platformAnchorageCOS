import { Suspense } from "react";
import Navbar from "./Navbar";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div>Something went wrong!</div>}>
      <div className="mb-16">
        <div>{children}</div>
        <Navbar />
      </div>
    </Suspense>
  );
}

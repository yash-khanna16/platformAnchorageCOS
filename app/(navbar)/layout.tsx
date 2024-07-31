import Navbar from "./Navbar";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mb-16">
      <div>{children}</div>
      <Navbar />
    </div>
  );
}

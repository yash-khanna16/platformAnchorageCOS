import Navbar from "./Navbar";


export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <Navbar />
      {children}
    </div>
  );
}

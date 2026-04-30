type OrderingLayoutProps = {
  children: React.ReactNode;
};

export default function OrderingLayout({ children }: OrderingLayoutProps) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-4">
      {children}
    </div>
  );
}

// Owner: A (Frontend).
export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center py-8">
      <div className="h-[844px] w-[390px] overflow-y-auto rounded-[3rem] border-8 border-neutral-800 bg-white shadow-xl">
        {children}
      </div>
    </div>
  );
}

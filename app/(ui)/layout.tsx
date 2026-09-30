// Owner: A (Frontend). Phone-frame wrapper around every screen.
import PhoneFrame from "@/components/PhoneFrame";

export default function UiLayout({ children }: { children: React.ReactNode }) {
  return <PhoneFrame>{children}</PhoneFrame>;
}

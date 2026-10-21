import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/dal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="app-shell">
      <Sidebar user={{ name: user.name, email: user.email }} />
      <main className="main">{children}</main>
    </div>
  );
}

import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, ClipboardList, BarChart3, Folder } from "lucide-react";


interface Props {
  children: ReactNode;
}

const AdminLayout = ({ children }: Props) => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Orders", path: "/admin/orders", icon: ClipboardList },
    { name: "Products", path: "/admin/products", icon: ShoppingBag },
    { name: "Categories", path: "/admin/categories", icon: Folder },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-8">Admin Panel</h2>

        <nav className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-primary/10"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
};

export default AdminLayout;
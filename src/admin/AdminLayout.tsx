import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  BarChart3,
  Folder,
  LogOut
} from "lucide-react";

interface Props {
  children: ReactNode;
}

const AdminLayout = ({ children }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Later you can add auth logout logic here
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },

    {
      name: "Orders",
      path: "/admin/orders",
      icon: ClipboardList,
      children: [
        { name: "Pending", path: "/admin/orders/pending" },
        { name: "Accepted", path: "/admin/orders/accepted" },
        { name: "Rejected", path: "/admin/orders/rejected" }
      ]
    },

    { name: "Products", path: "/admin/products", icon: ShoppingBag },
    { name: "Categories", path: "/admin/categories", icon: Folder },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 hidden md:flex flex-col">
        <div>
          <h2 className="text-xl font-bold mb-8">Admin Panel</h2>

          <nav className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.path);

              return (
                <div key={item.path}>
                  {/* Parent */}
                  <Link
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

                  {/* Submenu */}
                  {item.children && active && (
                    <div className="ml-8 mt-2 space-y-2">
                      {item.children.map((child) => {
                        const subActive = location.pathname === child.path;

                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`block text-sm px-3 py-1 rounded-md ${
                              subActive
                                ? "bg-primary/20 text-primary"
                                : "hover:bg-primary/10"
                            }`}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="mt-auto pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
};

export default AdminLayout;
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type Role = "admin" | "delivery" | "superadmin";

const ManageAdminsPage = () => {
  const { role, user } = useAuth();

  const [admins, setAdmins] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("admin");
  const [loading, setLoading] = useState(false);

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from("admin_users")
      .select(`
        id,
        role,
        auth_user_id,
        customers (email, name)
      `);

    if (error) {
      console.error(error);
      return;
    }

    setAdmins(data || []);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  if (role !== "superadmin") {
    return <p className="p-6">Access denied.</p>;
  }

  // 🔥 Assign or Update Role
  const assignRole = async () => {
    if (!email) {
      toast.error("Enter user email");
      return;
    }

    setLoading(true);

    try {
      const { data: customer, error: custError } = await supabase
        .from("customers")
        .select("auth_user_id")
        .eq("email", email)
        .single();

      if (custError || !customer) {
        toast.error("User must register first.");
        return;
      }

      // Check if already in admin_users
      const { data: existing } = await supabase
        .from("admin_users")
        .select("id")
        .eq("auth_user_id", customer.auth_user_id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("admin_users")
          .update({ role: selectedRole })
          .eq("auth_user_id", customer.auth_user_id);

        toast.success("Role updated successfully");
      } else {
        await supabase.from("admin_users").insert([
          {
            auth_user_id: customer.auth_user_id,
            role: selectedRole,
          },
        ]);

        toast.success("Role assigned successfully");
      }

      setEmail("");
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Demote to Customer (Remove role)
  const removeRole = async (authUserId: string) => {
    if (authUserId === user?.id) {
      toast.error("You cannot remove your own superadmin role.");
      return;
    }

    await supabase
      .from("admin_users")
      .delete()
      .eq("auth_user_id", authUserId);

    toast.success("Role removed. User is now a customer.");
    fetchAdmins();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        Super Admin Panel – Role Management
      </h1>

      {/* Assign Role */}
      <div className="mb-10 p-6 border rounded-lg bg-muted/30">
        <h2 className="text-lg font-semibold mb-4">Assign / Update Role</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="email"
            placeholder="User Email"
            className="border px-3 py-2 rounded w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <select
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(e.target.value as Role)
            }
            className="border px-3 py-2 rounded"
          >
            <option value="admin">Admin</option>
            <option value="delivery">Delivery</option>
            <option value="superadmin">Super Admin</option>
          </select>

          <button
            onClick={assignRole}
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            {loading ? "Processing..." : "Save Role"}
          </button>
        </div>
      </div>

      {/* Existing Roles */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Existing Role Assignments
        </h2>

        <div className="space-y-4">
          {admins.map((admin) => (
            <div
              key={admin.auth_user_id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {admin.customers?.name || "No Name"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {admin.customers?.email}
                </p>
                <p className="text-xs mt-1 font-medium text-accent">
                  {admin.role}
                </p>
              </div>

              {admin.role !== "superadmin" && (
                <button
                  onClick={() =>
                    removeRole(admin.auth_user_id)
                  }
                  className="text-red-600 text-sm"
                >
                  Demote to Customer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageAdminsPage;
"use client";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-blue-900 text-white p-6 flex flex-col gap-6 shadow-xl">
        <h2 className="text-2xl font-bold text-center">🛠️ Admin Dashboard</h2>
        <nav className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/adminDashboard/affiliates")}
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            🤝 Manage Affiliates
          </button>
          <button
            onClick={() => router.push("/adminDashboard/add-product")}
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            📦 Manage Products
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-0">
          {/* Affiliates Card */}
          <section className="bg-white p-6 rounded-xl shadow hover:shadow-2xl border border-blue-200 flex flex-col">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              🤝 Manage Affiliates
            </h3>
            <div className="flex flex-col gap-3 w-full">
              {[
                { label: "📝 Approve Requests", href: "/adminDashboard/affiliates/requests" },
                { label: "✅ Approved Requests", href: "/adminDashboard/affiliates/approved" },
                { label: "💸 Commissions", href: "/adminDashboard/affiliates/commissions" },
                { label: "👀 Visits", href: "/adminDashboard/affiliates/visits" },
                { label: "🔗 Referral Links", href: "/adminDashboard/affiliates/links" },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => router.push(btn.href)}
                  className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-800 transition"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </section>

          {/* Products Card */}
          <section className="bg-white p-6 rounded-xl shadow hover:shadow-2xl border border-green-200 flex flex-col">
            <h3 className="text-2xl font-bold text-green-900 mb-4">
              📦 Manage Products
            </h3>
            <div className="flex flex-col gap-3 w-full">
              {[
                { label: "➕ Add Product", href: "/adminDashboard/add-product" },
                { label: "🛠️ Edit Product", href: "/adminDashboard/edit-product" },
                { label: "🗑️ Delete Product", href: "/adminDashboard/delete-product" },
                { label: "📋 View All Products", href: "/adminDashboard/view-products" },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => router.push(btn.href)}
                  className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-800 transition"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

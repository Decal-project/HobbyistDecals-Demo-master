"use client";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-blue-900 text-white p-6 flex flex-col gap-6 shadow-xl overflow-y-auto">
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
          <button
            onClick={() => router.push("/adminDashboard/orders/all")}
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            📑 Manage Orders
          </button>
          <button
            onClick={() => router.push("/adminDashboard/customers/list")}
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            👥 Customer Management
          </button>
          <button
            onClick={() => router.push("/adminDashboard/payments/reports")}
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            💳 Payment & Transactions
          </button>
          <button
            onClick={() => router.push("/adminDashboard/analytics/sales")}
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            📈 Analytics & Reporting
          </button>
          <button
            onClick={() =>
              router.push("/adminDashboard/admin-users/reset-password")
            }
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            🔐 Admin User Roles
          </button>
          {/* New Blogs Section */}
          <button
            onClick={() => router.push("/adminDashboard/blogs/list")}
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            📝 Manage Blogs
          </button>
          <button
            onClick={() => router.push("/adminDashboard/custom/list")}
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            📝 Manage Custom Decals We&apos;ve Created
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="🤝 Manage Affiliates"
          color="blue"
          options={[
            {
              label: "📝 Approve Requests",
              href: "/adminDashboard/affiliates/approve",
            },
            {
              label: "✅ Approved Requests",
              href: "/adminDashboard/affiliates/approved",
            },
            {
              label: "💸 Commissions",
              href: "/adminDashboard/affiliates/commissions",
            },
            { label: "👀 Visits", href: "/adminDashboard/affiliates/visits" },
            {
              label: "🔗 Referral Links",
              href: "/adminDashboard/affiliates/links",
            },
          ]}
        />
        <DashboardCard
          title="📦 Manage Products"
          color="green"
          options={[
            { label: "➕ Add Product", href: "/adminDashboard/add-product" },
            {
              label: "🛠️ Edit Product",
              href: "/adminDashboard/add-product/edit",
            },
            {
              label: "📋 View All Products",
              href: "/adminDashboard/add-product/list",
            },
          ]}
        />
        <DashboardCard
          title="📑 Manage Orders"
          color="yellow"
          options={[
            { label: "📋 View All Orders", href: "/adminDashboard/orders/all" },
            {
              label: "↩️ Refund / Cancel Orders",
              href: "/adminDashboard/orders/refund-cancel",
            },
            {
              label: "📦 Track Shipment",
              href: "/adminDashboard/orders/track",
            },
            {
              label: "📝 Customer Notes",
              href: "/adminDashboard/orders/notes",
            },
          ]}
        />
        <DashboardCard
          title="👥 Customer Management"
          color="purple"
          options={[
            {
              label: "📃 View Customer List",
              href: "/adminDashboard/customers/list",
            },
            {
              label: "🧾 Order History & Contact",
              href: "/adminDashboard/customers/history",
            },
            {
              label: "🎁 Loyalty Discounts",
              href: "/adminDashboard/customers/loyalty",
            },
          ]}
        />
        <DashboardCard
          title="💳 Payment & Transactions"
          color="red"
          options={[
            {
              label: "📊 View Transaction History",
              href: "/adminDashboard/payments/history",
            },
            {
              label: "⚠️ Failed Transactions",
              href: "/adminDashboard/payments/failed",
            },
            {
              label: "📈 Transaction Reports",
              href: "/adminDashboard/payments/reports",
            },
          ]}
        />
        <DashboardCard
          title="📈 Analytics & Reporting"
          color="indigo"
          options={[
            {
              label: "💰 Sales Overview",
              href: "/adminDashboard/analytics/sales",
            },
            {
              label: "🔥 Top-Selling Decals",
              href: "/adminDashboard/analytics/top-products",
            },
            {
              label: "👑 Most Active Customers",
              href: "/adminDashboard/analytics/customers",
            },
            {
              label: "📉 Inventory Alerts",
              href: "/adminDashboard/analytics/inventory",
            },
            {
              label: "🛒 Abandoned Carts",
              href: "/adminDashboard/analytics/carts",
            },
          ]}
        />
        <DashboardCard
          title="🔐 Admin User Roles"
          color="gray"
          options={[
            {
              label: "🔁 Reset Admin Password",
              href: "/adminDashboard/admin-users/reset-password",
            },
          ]}
        />
        <DashboardCard
          title="📝 Manage Blogs"
          color="teal"
          options={[
            {
              label: "➕ Create Blog Post",
              href: "/adminDashboard/blogs/create",
            },
            {
              label: "✏️ Edit Blog Posts",
              href: "/adminDashboard/blogs/edit",
            },
            {
              label: "📃 View Blog List",
              href: "/adminDashboard/blogs/list",
            },
          ]}
        />
        <DashboardCard
          title="🤝 Manage Custom Decals We&apos;ve Created"
          color="blue"
          options={[
            { label: "➕ Add Decals", href: "/adminDashboard/custom/add" },
            { label: "✏️ Edit Decals", href: "/adminDashboard/custom/edit" },
            { label: "📋 List Decals", href: "/adminDashboard/custom/list" },
          ]}
        />
      </main>
    </div>
  );

  function DashboardCard({
    title,
    color,
    options,
  }: {
    title: string;
    color: string;
    options: { label: string; href: string }[];
  }) {
    const router = useRouter();

    const cardColorMap: Record<string, string> = {
      blue: "text-blue-900 border-blue-200",
      green: "text-green-900 border-green-200",
      yellow: "text-yellow-900 border-yellow-200",
      purple: "text-purple-900 border-purple-200",
      red: "text-red-900 border-red-200",
      indigo: "text-indigo-900 border-indigo-200",
      gray: "text-gray-900 border-gray-300",
      teal: "text-teal-900 border-teal-200",
    };

    const buttonColorMap: Record<string, string> = {
      blue: "bg-blue-600 hover:bg-blue-800",
      green: "bg-green-600 hover:bg-green-800",
      yellow: "bg-yellow-600 hover:bg-yellow-800",
      purple: "bg-purple-600 hover:bg-purple-800",
      red: "bg-red-600 hover:bg-red-800",
      indigo: "bg-indigo-600 hover:bg-indigo-800",
      gray: "bg-gray-600 hover:bg-gray-800",
      teal: "bg-teal-600 hover:bg-teal-800",
    };

    return (
      <section
        className={`p-6 rounded-xl shadow border bg-white hover:shadow-2xl flex flex-col ${cardColorMap[color]}`}
      >
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <div className="flex flex-col gap-3 w-full">
          {options.map((btn) => (
            <button
              key={btn.label}
              onClick={() => router.push(btn.href)}
              className={`w-full py-3 text-white rounded transition ${buttonColorMap[color]}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </section>
    );
  }
}

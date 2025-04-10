"use client";
import { useRouter } from "next/navigation";
//import { Button } from "@/components/ui/button"; // optional if using shadcn/ui
import React from "react";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome, Admin!</h1>
      <p className="mb-8 text-gray-600">Choose an action below:</p>

      <button
        onClick={() => router.push("/adminDashboard/add-product")}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Manage Products
      </button>
    </div>
  );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const router = useRouter();

  // For now, a simple hardcoded UI — later you can add fetch user info

  const handleLogout = () => {
    // Clear login state here (e.g., clear localStorage or cookies)
    // Then redirect to login page
    router.push("/user-login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-[#16689A] mb-6">Your Profile</h1>

        <p className="text-lg mb-4">Welcome back! This is your profile page.</p>

        {/* Later you can show user details here */}

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;

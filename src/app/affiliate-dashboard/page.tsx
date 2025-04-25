"use client";

import React, { useState, useEffect } from "react";

// Type definitions
type Visit = {
  landing_url: string;
  date: string;
};

type Stats = {
  visitsCount: number;
  commissions: number;
  earnings: number;
};

type AffiliateLinks = {
  website: string;
  trackingLink: string;
};

type PaymentEmailResponse = {
  paymentEmail?: string;
};

export default function AffiliateDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<Stats>({
    visitsCount: 0,
    commissions: 0,
    earnings: 0,
  });
  const [links, setLinks] = useState<AffiliateLinks>({
    website: "",
    trackingLink: "",
  });
  const [paymentEmail, setPaymentEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/affiliate/user")
      .then((res) => res.json())
      .then((data) => {
        setUserId(data.userId);
        console.log("Fetched User ID:", data.userId);
      })
      .catch((err) => {
        console.error("Error loading user data:", err);
      });
  }, []);

  useEffect(() => {
    if (userId) {
      const trackingLink = `https://hobbyist-decals.vercel.app/?ref=${userId}`;
      console.log("Generated Tracking Link:", trackingLink);
      setLinks((prev) => ({
        ...prev,
        trackingLink,
      }));
    }
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchAndParse = async (url: string) => {
          const res = await fetch(url);
          const contentType = res.headers.get("Content-Type");
          const text = await res.text();

          if (!res.ok) throw new Error(text || `Request failed for ${url}`);

          if (text.trim() === "" || !contentType?.includes("application/json")) {
            console.warn(`Empty or invalid JSON from ${url}`);
            return {};
          }

          return JSON.parse(text);
        };

        if (tab === "dashboard") {
          const data = await fetchAndParse("/api/affiliate/dashboard");
          setStats(data as Stats);
        }

        if (tab === "affiliate-links") {
          const data = await fetchAndParse("/api/affiliate/links");
          setLinks(data as AffiliateLinks);
        }

        if (tab === "visits") {
          const data = await fetchAndParse("/api/affiliate/visits");
          setVisits(data as Visit[]);
        }

        if (tab === "settings") {
          const data = await fetchAndParse("/api/affiliate/settings");
          const paymentData = data as PaymentEmailResponse;
          setPaymentEmail(paymentData.paymentEmail || "");
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, [tab]);

  const updateAffiliateLinks = async () => {
    try {
      const res = await fetch("/api/affiliate/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(links),
      });
      alert(res.ok ? "Links updated!" : "Failed to update links.");
    } catch (error) {
      console.error(error);
      alert("Error updating links.");
    }
  };

  const updatePaymentEmail = async () => {
    try {
      const res = await fetch("/api/affiliate/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentEmail }),
      });
      const data = await res.json();
      alert(res.ok ? "Email updated!" : data.error || "Failed to update email.");
    } catch (error) {
      console.error(error);
      alert("Error updating email.");
    }
  };

  const renderContent = () => {
    switch (tab) {
      case "affiliate-links":
        return (
          <div className="space-y-4">
            <div>
              <label className="block">Your Website:</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded px-4 py-2"
                value={links.website}
                onChange={(e) => setLinks({ ...links, website: e.target.value })}
              />
            </div>
            <div>
              <label className="block">Your Tracking Link:</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded px-4 py-2"
                value={links.trackingLink}
                readOnly
              />
            </div>
            <button
              onClick={updateAffiliateLinks}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update Links
            </button>
          </div>
        );

      case "dashboard":
        return (
          <>
            <div className="flex space-x-4 mb-6">
              <div className="p-4 border rounded w-1/3 text-center">
                <p className="text-lg font-semibold">Visits</p>
                <p className="text-2xl">{stats.visitsCount}</p>
              </div>
              <div className="p-4 border rounded w-1/3 text-center">
                <p className="text-lg font-semibold">Commissions</p>
                <p className="text-2xl">${stats.commissions.toFixed(2)}</p>
              </div>
              <div className="p-4 border rounded w-1/3 text-center">
                <p className="text-lg font-semibold">Earnings</p>
                <p className="text-2xl">${stats.earnings.toFixed(2)}</p>
              </div>
            </div>
            <div className="h-64 border rounded flex items-center justify-center text-gray-400">
              Chart Placeholder
            </div>
          </>
        );

      case "visits":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">Recent Visits</h2>
            {visits.length === 0 ? (
              <p className="text-gray-500">No visits recorded yet.</p>
            ) : (
              <table className="w-full text-left border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Landing URL</th>
                    <th className="p-2 border">Visited At</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit, index) => (
                    <tr key={index}>
                      <td className="p-2 border">{visit.landing_url}</td>
                      <td className="p-2 border">
                        {new Date(visit.date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case "settings":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">Settings</h2>
            <div>
              <label className="block">Payment Email:</label>
              <input
                type="email"
                className="mt-1 block w-full border border-gray-300 rounded px-4 py-2"
                value={paymentEmail}
                onChange={(e) => setPaymentEmail(e.target.value)}
              />
            </div>
            <button
              onClick={updatePaymentEmail}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Update Email
            </button>
          </div>
        );

      default:
        return (
          <div className="text-gray-500">
            This section is under construction.
          </div>
        );
    }
  };

  const navItems = [
    { label: "Dashboard", value: "dashboard" },
    { label: "Affiliate Links", value: "affiliate-links" },
    { label: "Visits", value: "visits" },
    { label: "Creatives", value: "creatives" },
    { label: "Payouts", value: "payouts" },
    { label: "Settings", value: "settings" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Affiliate Panel</h1>
      <div className="flex space-x-6 border-b mb-6 pb-2 text-gray-600">
        {navItems.map((item) => (
          <button
            key={item.value}
            onClick={() => setTab(item.value)}
            className={`hover:text-black font-medium ${
              tab === item.value ? "border-b-2 border-black text-black" : ""
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {renderContent()}
    </div>
  );
}

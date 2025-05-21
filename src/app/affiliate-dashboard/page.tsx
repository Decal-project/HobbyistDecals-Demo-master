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
  destinationUrl: string;
  code: string;
  trackingLink: string;
  visitCount: number;
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
    website: "https://hobbyist-decals.vercel.app/",
    destinationUrl: "",
    code: "",
    trackingLink: "",
    visitCount: 0,
  });
  const [paymentEmail, setPaymentEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

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
          fetchAffiliateData(); // replace with your new function
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

  const fetchAffiliateData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/affiliate/links?id=1");
      const data = await res.json();
      setLinks((prev) => ({
        ...prev,
        destinationUrl: data.destinationUrl || prev.website,
        code: data.code || "",
        trackingLink: data.trackingLink || "",
        visitCount: data.visitCount || 0,
      }));
      if (data.code) setIsSaved(true);
    } catch {
      setError("Failed to load affiliate data");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setLoading(true);
    setError(null);
    try {
      const { website, destinationUrl, code } = links;
      const res = await fetch("/api/affiliate/links?id=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website, destinationUrl, code }),
      });

      const data = await res.json();
      setLinks((prev) => ({
        ...prev,
        trackingLink: data.trackingLink,
      }));

      setIsSaved(true);
      alert("Links updated!");
    } catch (error) {
      setError("Failed to save affiliate data");
    } finally {
      setLoading(false);
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

  const handleLinkClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      await fetch("/api/track-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: links.code }),
      });

      window.open(`/redirect?code=${encodeURIComponent(links.code)}`, "_blank");
    } catch (error) {
      console.error("Failed to track click:", error);
    }
  };

  const renderContent = () => {
    switch (tab) {
      case "affiliate-links":
        return (
          <div className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <>
                <div>
                  <label className="block">Your Website:</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded px-4 py-2"
                    value={links.website}
                    onChange={(e) =>
                      setLinks({ ...links, website: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block">Affiliate Code:</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded px-4 py-2"
                    value={links.code}
                    onChange={(e) =>
                      setLinks({ ...links, code: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block">Destination URL:</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded px-4 py-2"
                    value={links.destinationUrl}
                    onChange={(e) =>
                      setLinks({ ...links, destinationUrl: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block">Tracking Link:</label>
                  <a
                    href="#"
                    onClick={handleLinkClick}
                    className="text-blue-600 underline break-all"
                  >
                    {links.trackingLink}
                  </a>
                </div>
                <div>
                  <label className="block">Total Visits:</label>
                  <p className="text-lg font-medium">{links.visitCount}</p>
                </div>
                <button
                  onClick={save}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save & Generate Link
                </button>
              </>
            )}
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Payment Email
            </button>
          </div>
        );

      default:
        return <div>Select a tab to view content.</div>;
    }
  };

  return (
    <div className="flex">
      <div className="w-1/4 bg-gray-100 p-6 space-y-4">
        <button
          className="w-full py-2 px-4 text-left"
          onClick={() => setTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className="w-full py-2 px-4 text-left"
          onClick={() => setTab("affiliate-links")}
        >
          Affiliate Links
        </button>
        <button
          className="w-full py-2 px-4 text-left"
          onClick={() => setTab("visits")}
        >
          Visits
        </button>
        <button
          className="w-full py-2 px-4 text-left"
          onClick={() => setTab("settings")}
        >
          Settings
        </button>
      </div>
      <div className="w-3/4 p-6">{renderContent()}</div>
    </div>
  );
}

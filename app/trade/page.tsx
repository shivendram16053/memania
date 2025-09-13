"use client";

import BuyNFT from "@/components/BuyNFT";
import Navbar from "@/components/Navbar";
import SellNFT from "@/components/SellNFT";
import { BrowserProvider } from "ethers";
import React, { useState } from "react";
import { useAccount } from "wagmi";

const Page = () => {
  const { address } = useAccount();
  
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");

  if (!address)
    return (
      <div className="flex flex-col items-center font-[var(--font-geist-sans)] min-h-screen">
        <Navbar/>
      <div className="p-16 mt-[-30px] flex flex-col items-center w-full">
        <h1 className="text-black text-3xl font-bold mb-8">Trade your NFTS</h1>

        <div className="flex items-center gap-3  text-black px-6 py-3 rounded-xl  font-semibold">
          <span>Connect Your Wallet</span>
        </div>
      </div>
    </div>
    );

  return (
    <div className="flex flex-col items-center font-[var(--font-geist-sans)]">
      <Navbar />

      {/* Header Tabs */}
      <div className="flex flex-col items-start w-full p-16 mt-[-30px]">
        <div className="flex rounded-lg p-1">
          <button
            className={`px-6 py-2  rounded-md font-semibold transition-all duration-300 ${
              activeTab === "buy"
                ? "bg-[#FAEED4] text-black shadow-md border-black border "
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("buy")}
          >
            Buy
          </button>
          <button
            className={`px-6 py-2   rounded-md font-semibold transition-all duration-300 ${
              activeTab === "sell"
                ? "bg-[#FAEED4] text-black shadow-md border-black border"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("sell")}
          >
            Sell
          </button>
        </div>

        <div className="mt-4">
        {activeTab === "buy" ? (
          <BuyNFT/>
        ) : (
          <SellNFT/>
        )}
      </div>
      </div>

      
    </div>
  );
};

export default Page;

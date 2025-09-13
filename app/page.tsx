"use client";

import HomePage from "@/components/HomePage";
import LandingPage from "@/components/LandingPage";
import Navbar from "@/components/Navbar";
import { useAccount } from "wagmi";

export default function Home() {

  const {isConnected}=useAccount();

  if(!isConnected){
    return (
      <div className="flex items-center flex-col justify-items-center font-[family-name:var(--font-geist-sans)]">
        <Navbar/>
        <LandingPage/>
      </div>
    )
  }
  return (
    <div className="flex items-center flex-col justify-items-center font-[family-name:var(--font-geist-sans)]">
      <Navbar/>
      <HomePage/>
    </div>
  );
}

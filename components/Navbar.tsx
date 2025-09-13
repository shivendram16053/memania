"use client";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import Link from "next/link";
import React from "react";
import { useAccount } from "wagmi";

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  return (
    <nav
      className="bg-[#FAEED4] mt-10 w-11/12 rounded-md p-4 flex justify-between items-center border-black border-2 shadow-[3px_3px_0px_#171717] transition-all duration-300"
    >
      {/* Logo */}
      <Link href="/">
        <div
          className="text-white text-4xl"
          style={{
            WebkitTextStroke: "2px black",
            WebkitTextFillColor: "white",
            filter: "brightness(10)",
          }}
        >
          MEMANIA
        </div>
      </Link>

      {/* Menu */}
      <ul className="flex gap-6 text-lg font-semibold text-gray-900">
        <li className="nav-item">
          <Link href="/">Home</Link>
        </li>
        <li className="nav-item">
          <Link href="/gallery">Gallery</Link>
        </li>
        <li className="nav-item">
          <Link href="/trade">Trade</Link>
        </li>
      </ul>

      {/* Connect Wallet Button */}
      {!isConnected ? (
        <button
          className="bg-[#ffffff] border border-black rounded-md text-black shadow-[-4px_4px_0px_#171717] font-bold py-2 px-4 hover:bg-black hover:shadow-yellow-300 hover:text-white transition-all duration-300"
          onClick={() => open()}
        >
          Connect Wallet
        </button>
      ) : (
        <button
          className="bg-[#ffffff] border border-black rounded-md text-black shadow-[-4px_4px_0px_#171717] font-bold py-2 px-4 hover:bg-black hover:shadow-yellow-300 hover:text-white transition-all duration-300"
          onClick={() => open({ view: "Account" })}
        >
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </button>
      )}
    </nav>
  );
};

export default Navbar;

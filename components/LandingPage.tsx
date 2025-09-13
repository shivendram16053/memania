import React from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";

const LandingPage = () => {
    const {open} = useWeb3Modal();
  
  return (
    <div className="flex flex-col md:flex-row justify-center  p-14 pl-40">
      
      {/* Meme Image */}
      <div className="w-4/12 flex flex-col justify-center items-center mb-6 md:mb-0">
        <img src={"/landingPage.png"} alt="Meme Image" className="rounded-3xl shadow-lg shadow-black w-3/4 md:w-full" />
      </div>

      {/* Text Content */}
      <div className=" w-full md:w-1/2 py-10  md:text-left px-20">
        <h1 className="text-7xl font-extrabold text-black mb-4">
          Meme Your Way to the Moon!
        </h1>
        <p className="text-2xl text-gray-800 leading-relaxed">
          Create & Mint Your Own <span className="font-bold text-black">Memecoin</span> Instantly with AI on <span className="font-bold">Somania Chain</span>.
        </p>

        <button
          className="bg-[#ffffff] mt-10 border border-black rounded-md text-black shadow-[-4px_4px_0px_#171717] font-bold py-2 px-4  hover:bg-black hover:shadow-white hover:text-white transition-all duration-300"
          onClick={() => open()}
        >
          Start Here
        </button>
      </div>
      
    </div>
  );
};

export default LandingPage;

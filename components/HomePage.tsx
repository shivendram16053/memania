"use client";

import React, { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import MemaniaAbi from "@/utils/Memania.json";
import { BrowserProvider, Contract } from "ethers";
import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

const HomePage = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState("Mint");
  const [explorerLink, setExplorerLink] = useState("");
  const CA = process.env.NEXT_PUBLIC_SMART_CONTRACT as `0x${string}`;
  const formData = new FormData();
  formData.append("prompt", "Create a meme Image for " + input);

  const generateMeme = async () => {
    setLoading(true);
    if (!input.trim()) return;

    try {
      const response = await fetch("https://clipdrop-api.co/text-to-image/v1", {
        method: "POST",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_CLIPDROP_API_KEY || "",
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to generate image");

      const blob = await response.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${input}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMint = async () => {
    try {
      if (!imageUrl) throw new Error("Please generate an image first.");

      setMinting("Uploading Image...");
      const response = await fetch(imageUrl);
      const file = new File([await response.blob()], `${input}.png`, { type: "image/png" });
      const uploadImage = await pinata.upload.file(file);
      const imageIPFSUrl = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${uploadImage.IpfsHash}`;

      setMinting("Uploading Metadata...");
      const uploadMetadata = await pinata.upload.json({
        name: "Memania NFT",
        description: input,
        image: imageIPFSUrl,
      });
      const metadataURI = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${uploadMetadata.IpfsHash}`;

      if (!address || !walletClient) throw new Error("Please connect your wallet first!");

      setMinting("Confirming Transaction...");
      const contract = new Contract(CA, MemaniaAbi.abi, await new BrowserProvider(walletClient).getSigner());
      const tx = await contract.mintMemeNFT(address, "Memania NFT", input, metadataURI);
      setMinting("Waiting for Confirmation...");
      const receipt = await tx.wait();
  
      setExplorerLink(`https://testnet.snowtrace.io/tx/${tx.hash}?chainid=43113`);
      setMinting("Minted Successfully!");
    } catch (error) {
      console.error("Minting failed:", error);
    } finally {
      setMinting("Mint");
    }
  };

  return (
    <div className="flex flex-col items-center w-full m-20 text-black">
      <div className="relative p-5 w-[600px]">
      <input
  type="text"
  placeholder="Describe your meme idea..."
  value={input}
  onChange={(e) => setInput(e.target.value)}
  className="bg-white w-full border-2 border-black rounded-full py-3 px-5 text-lg font-medium pr-32"
/>

        <button onClick={generateMeme} className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-black text-white font-bold px-5 py-2 rounded-full hover:bg-gray-800 transition duration-300">
          Generate
        </button>
      </div>

      {loading ? (
        <div className="w-[512px] h-[512px] bg-gray-300 flex items-center justify-center rounded-lg animate-pulse mt-10">
          <span className="text-xl font-bold text-gray-700">Generating...</span>
        </div>
      ) : imageUrl ? (
        <div className="flex flex-col items-center mt-10">
          <img src={imageUrl} alt="Generated Meme" className="w-[512px] h-[512px] rounded-lg shadow-lg" />
          <div className="flex gap-5 mt-5 w-full">
            <button onClick={handleDownload} className="bg-white w-1/2 border border-black rounded-md text-black font-bold py-2 px-4 hover:bg-black hover:text-white transition-all">
              Download
            </button>
            <button onClick={handleMint} className="bg-yellow-400 w-1/2 border border-black rounded-md text-black font-bold py-2 px-4 hover:bg-black hover:text-white transition-all">
              {minting}
            </button>
          </div>
          {explorerLink && (
            <p className="mt-7 text-xl font-semibold text-black underline">
              <a href={explorerLink} target="_blank" rel="noopener noreferrer">View on Explorer</a>
            </p>
          )}
        </div>
      ) : (
        <div className="w-2/6 mt-10 p-5">
          <h1 className="text-3xl font-extrabold text-black mb-4">Some Ideas</h1>
          <ul className="text-lg font-medium space-y-3">
            {["Create a meme image of a unicorn", "A dog playing with a ball", "Elon Musk riding a Shiba Inu to the moon", "A cat sleeping under the blanket"].map((idea) => (
              <li key={idea} className="cursor-pointer hover:text-yellow-50 transition" onClick={() => setInput(idea)}>
                {idea}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HomePage;

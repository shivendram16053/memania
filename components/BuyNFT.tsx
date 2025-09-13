"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { BrowserProvider, Contract, parseEther,ethers } from "ethers";
import MemaniaAbi from "@/utils/Memania.json";
import { useAccount, useWalletClient } from "wagmi";

const CA = process.env.NEXT_PUBLIC_SMART_CONTRACT as `0x${string}`;

const BuyNFT = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [listedNFTs, setListedNFTs] = useState<number[]>([]);
  const [nftData, setNftData] = useState<{ [key: number]: {
    priceInEth: ReactNode; image: string; title: string; price: string 
} }>({});
  const [loading, setLoading] = useState({
    fetchNFTs: false,
    buying: {} as { [key: number]: boolean }
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchListedNFTs();
  }, [walletClient]);

  const fetchListedNFTs = async () => {
    if (!walletClient) return;
    
    setLoading(prev => ({ ...prev, fetchNFTs: true }));
    try {
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const contract = new Contract(CA, MemaniaAbi.abi, signer);

      const listedNFTs = await contract.getAllListedNFTs();
      setListedNFTs(listedNFTs);

      const metadataPromises = listedNFTs.map(async (tokenId: number) => {
        const [title, , tokenURI] = await contract.getNFTDetails(tokenId);
        const response = await fetch(tokenURI);
        const metadata = await response.json();
        const { price } = await contract.getListing(tokenId);

        const priceInEth = ethers.formatUnits(price,9)

        return { tokenId, image: metadata.image, title, priceInEth };
      });

      const metadataArray = await Promise.all(metadataPromises);
      const metadataMap = Object.fromEntries(metadataArray.map((data) => [data.tokenId, data]));
      setNftData(metadataMap);
    } catch (error) {
      console.error("Error fetching listed NFTs:", error);
      setMessage("Failed to fetch NFTs");
    } finally {
      setLoading(prev => ({ ...prev, fetchNFTs: false }));
    }
  };

  const buyNFT = async (tokenId: number, price: string) => {
    if (!walletClient || !address) return;

    try {
      setLoading(prev => ({ 
        ...prev, 
        buying: { ...prev.buying, [tokenId]: true } 
      }));
      setMessage("");

      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const contract = new Contract(CA, MemaniaAbi.abi, signer);
      const priceInNum = Number(price);

      const priceInWei = parseEther(priceInNum.toString());

      const tx = await contract.buyNFT(tokenId, { 
        value: priceInWei, 
        gasLimit: 500000 
      });
      await tx.wait();

      setMessage(`NFT #${tokenId} purchased successfully!`);
      fetchListedNFTs();
    } catch (error) {
      console.error(error);
      setMessage(`Error purchasing NFT #${tokenId}`);
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        buying: { ...prev.buying, [tokenId]: false } 
      }));
    }
  };

  if (loading.fetchNFTs) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-10 w-full rounded-lg">
      {listedNFTs.length === 0 ? (
        <div className="text-center mt-10">
          <p className="text-black text-3xl">No Listings found</p>
        </div>
      ) : (
        listedNFTs.map((tokenId) => (
          <div key={tokenId} className="bg-[#FAEED4] shadow-[-4px_4px_0px_#171717] mb-4 w-72 p-4 rounded">
            {nftData[tokenId]?.image && (
              <img
                src={nftData[tokenId].image}
                alt={`NFT ${tokenId}`}
                className="w-full h-auto rounded mb-2"
              />
            )}
            <p className="text-lg text-black font-semibold">{nftData[tokenId]?.title || `MeMania NFT #${tokenId}`}</p>
            <p className="text-md text-gray-700">Price: {nftData[tokenId]?.priceInEth} ETH</p>
            <button
              onClick={() => buyNFT(tokenId, nftData[tokenId]?.priceInEth as string)}
              disabled={loading.buying[tokenId] || !nftData[tokenId]?.priceInEth}
              className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 transition-all duration-300"
            >
              {loading.buying[tokenId] ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                "Buy NFT"
              )}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default BuyNFT;
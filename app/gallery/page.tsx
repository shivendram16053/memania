"use client";

import React, { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { BrowserProvider, Contract } from "ethers";
import MemaniaAbi from "@/utils/Memania.json";
import Navbar from "@/components/Navbar";
import NFTmodal from "@/components/NFTmodal";

const CA = process.env.NEXT_PUBLIC_SMART_CONTRACT as `0x${string}`;

const GalleryPage = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<any | null>(null); // Modal state

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!walletClient) return;
      try {
        setLoading(true);
        const provider = new BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        const contract = new Contract(CA, MemaniaAbi.abi, signer);

        // Fetch all NFT IDs
        const tokenIds: number[] = await contract.getAllNFTs();

        // Fetch details for each NFT
        const nftDetails = await Promise.all(
          tokenIds.map(async (tokenId) => {
            const [title, description, metadataURI, creator, owner] =
              await contract.getNFTDetails(tokenId);

            try {
              const metadataRes = await fetch(metadataURI);
              if (!metadataRes.ok) throw new Error("Failed to fetch metadata");

              const metadata = await metadataRes.json();
              return {
                tokenId,
                contract: CA,
                title: metadata.name || title,
                description: metadata.description || description,
                image: metadata.image || "", // Ensure image exists
                creator,
                owner,
              };
            } catch (err) {
              console.error(
                `Failed to load metadata for Token ID ${tokenId}:`,
                err
              );
              return { tokenId, title, description, image: "", creator };
            }
          })
        );

        setNfts(nftDetails);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [walletClient]);

  // Open modal with NFT details
  const openModal = (nft: any) => {
    setSelectedNFT(nft);
  };

  // Close modal
  const closeModal = () => {
    setSelectedNFT(null);
  };

  if (!address)
    return (
      <div className="flex flex-col items-center font-[var(--font-geist-sans)] min-h-screen">
        <Navbar />
        <div className="p-16 mt-[-30px] flex flex-col items-center w-full">
          <h1 className="text-black text-3xl font-bold mb-8">NFT Gallery</h1>

          <div className="flex items-center gap-3  text-black px-6 py-3 rounded-xl  font-semibold">
            <span>Connect Your Wallet</span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center font-[var(--font-geist-sans)]">
      <Navbar />
      <div className="p-16 mt-[-30px] flex flex-col items-start w-full">
        <h1 className="text-black text-3xl font-bold mb-8">NFT Gallery</h1>

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-black"></div>
          </div>
        ) : nfts.length === 0 ? (
          <p className="text-xl text-gray-600">No NFTs found.</p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {nfts.map((nft) => (
              <div
                key={nft.tokenId}
                className="border-black  p-4 rounded-lg shadow-[-4px_4px_0px_#171717]  w-auto bg-[#FAEED4] cursor-pointer"
                onClick={() => openModal(nft)}
              >
                <img
                  src={nft.image} // ✅ Using correct `image` property
                  alt={nft.title}
                  className="w-60 h-60 object-cover rounded-lg"
                />
                <h2 className="text-xl font-bold mt-3 text-neutral-900">
                  {nft.title} #{nft.tokenId}
                </h2>
                <p className="text-gray-500 text-sm">
                  Created by:{" "}
                  <a
                    href={`https://shannon-explorer.somnia.network/address/${nft.creator}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}
                  </a>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for NFT Details */}
      {selectedNFT && (
        <NFTmodal
          closeModal={closeModal}
          selectedNFT={selectedNFT}
          owner={false}
        />
      )}
    </div>
  );
};

export default GalleryPage;

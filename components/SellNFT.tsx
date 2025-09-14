import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import MemaniaAbi from "@/utils/Memania.json";
import { useAccount, useWalletClient } from "wagmi";

const CA = process.env.NEXT_PUBLIC_SMART_CONTRACT as `0x${string}`;

interface NFTMetadata {
  tokenId: number;
  image: string;
}

interface LoadingState {
  fetchNFTs: boolean;
  listing: { [key: number]: boolean };
  canceling: { [key: number]: boolean };
}

const SellNFT = () => {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<number[]>([]); // Array of token IDs
  const [nftData, setNftData] = useState<Record<number, NFTMetadata>>({});
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<LoadingState>({
    fetchNFTs: false,
    listing: {},
    canceling: {},
  });
  const [listedNFTs, setListedNFTs] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<string>("");
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!walletClient || !address) return;

      setLoading((prev) => ({ ...prev, fetchNFTs: true }));
      try {
        const provider = new BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        const contract = new Contract(CA, MemaniaAbi.abi, signer);

        // Fetch owned NFTs
        const ownedNFTs: bigint[] = await contract.getNFTsByOwner(address);
        const ownedTokenIds = ownedNFTs.map((id) => Number(id));
        setNfts(ownedTokenIds);

        // Fetch metadata for each NFT
        const metadataPromises = ownedTokenIds.map(async (tokenId) => {
          const tokenURI: string = await contract.tokenURI(tokenId);
          const response = await fetch(tokenURI);
          const metadata = await response.json();
          return { tokenId, image: metadata.image as string };
        });

        const metadataArray = await Promise.all(metadataPromises);
        const metadataMap: Record<number, NFTMetadata> = Object.fromEntries(
          metadataArray.map((data) => [data.tokenId, data])
        );
        setNftData(metadataMap);

        // Fetch all listed NFTs
        const listed: bigint[] = await contract.getAllListedNFTs();
        setListedNFTs(new Set(listed.map((id) => Number(id))));
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        setMessage("Failed to fetch NFTs");
      } finally {
        setLoading((prev) => ({ ...prev, fetchNFTs: false }));
      }
    };
    fetchNFTs();
  }, [walletClient, address]);

  const handlePriceChange = (tokenId: number, value: string) => {
    setPrices((prevPrices) => ({ ...prevPrices, [tokenId]: value }));
  };

  const listNFTForSale = async (tokenId: number) => {
    if (!walletClient) return;
    try {
      setLoading((prev) => ({
        ...prev,
        listing: { ...prev.listing, [tokenId]: true },
      }));
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const contract = new Contract(CA, MemaniaAbi.abi, signer);
      const price = prices[tokenId] || "0";

      const priceInNEth = ethers.parseUnits(price, 9);

      const tx = await contract.listNFT(tokenId, priceInNEth);
      await tx.wait();

      setListedNFTs((prev) => new Set(prev).add(tokenId));
      setMessage(`NFT ${tokenId} listed successfully!`);
    } catch (error) {
      console.error(error);
      setMessage(`Error listing NFT ${tokenId}`);
    } finally {
      setLoading((prev) => ({
        ...prev,
        listing: { ...prev.listing, [tokenId]: false },
      }));
    }
  };

  const cancelListing = async (tokenId: number) => {
    if (!walletClient) return;
    try {
      setLoading((prev) => ({
        ...prev,
        canceling: { ...prev.canceling, [tokenId]: true },
      }));
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const contract = new Contract(CA, MemaniaAbi.abi, signer);

      const tx = await contract.cancelListing(tokenId);
      await tx.wait();

      setListedNFTs((prev) => {
        const updated = new Set(prev);
        updated.delete(tokenId);
        return updated;
      });
      setMessage(`NFT ${tokenId} unlisted successfully!`);
    } catch (error) {
      console.error(error);
      setMessage(`Error unlisting NFT ${tokenId}`);
    } finally {
      setLoading((prev) => ({
        ...prev,
        canceling: { ...prev.canceling, [tokenId]: false },
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
      {nfts.length === 0 ? (
        <div className="text-center mt-10">
          <p className="text-black text-3xl">You don&apos;t own any NFT</p>
        </div>
      ) : (
        nfts.map((tokenId) => (
          <div
            key={tokenId}
            className="bg-[#FAEED4] shadow-[-4px_4px_0px_#171717] mb-4 w-72 p-4 rounded relative"
          >
            {nftData[tokenId]?.image && (
              <img
                src={nftData[tokenId].image}
                alt={`NFT ${tokenId}`}
                className="w-full h-auto rounded mb-2"
              />
            )}
            <p className="text-lg text-black font-semibold">
              Memania NFT #{tokenId}
            </p>

            {!listedNFTs.has(tokenId) ? (
              <>
                <input
                  type="number"
                  placeholder="Price in STT"
                  value={prices[tokenId] || ""}
                  onChange={(e) => handlePriceChange(tokenId, e.target.value)}
                  className="w-full p-2 border border-black outline-none text-black rounded mb-2"
                />
                <button
                  onClick={() => listNFTForSale(tokenId)}
                  disabled={loading.listing[tokenId]}
                  className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 transition-all duration-300"
                >
                  {loading.listing[tokenId] ? (
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                      Listing...
                    </div>
                  ) : (
                    "List NFT"
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => cancelListing(tokenId)}
                disabled={loading.canceling[tokenId]}
                className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-800 transition-all duration-300"
              >
                {loading.canceling[tokenId] ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                    Canceling...
                  </div>
                ) : (
                  "Cancel Listing"
                )}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default SellNFT;

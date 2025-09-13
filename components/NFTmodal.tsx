import React from "react";

interface NFT {
  contract: string;
  image: string;
  title: string;
  tokenId: number;
  description: string;
  creator: string;
  contractAddress: string;
  transfers?: { hash: string; age: string }[];
}

interface NFTModalProps {
  closeModal: () => void;
  selectedNFT: NFT;
  owner: boolean;
}

const NFTModal: React.FC<NFTModalProps> = ({ closeModal, selectedNFT ,owner }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={closeModal} // Close modal when clicking outside
    >
     <div className="bg-[#d0c09f]  p-6 rounded-lg shadow-lg w-3/5  relative flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-xl"
        >
          ✖
        </button>

        {/* Left Side - NFT Image */}
        <div className="md:w-1/2 flex justify-center items-center">
          <img
            src={selectedNFT.image}
            alt={selectedNFT.title}
            className="w-[90%] object-cover"
          />
        </div>

        {/* Right Side - NFT Details */}
        <div className="md:w-1/2 p-4 flex flex-col items-start">
          <h2 className="text-5xl font-bold text-neutral-900 text-center">
            {selectedNFT.title} #{selectedNFT.tokenId}
          </h2>

          <div className="mt-5 text-lg flex flex-col items-start gap-3">
          <p className="text-stone-950"><strong>Prompt : </strong><span>{selectedNFT.description}</span></p>
            <p className="text-gray-600">
              <strong>Blockchain:</strong> Fuji (43113)
            </p>
            <p className="text-gray-600">
              <strong>Contract:</strong>{" "}
              <a
                href={`https://testnet.snowtrace.io/address/${selectedNFT.contract}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {selectedNFT.contract}
              </a>
            </p>
            <p className="text-gray-600">
              <strong>Created By: </strong> 
              <a
                href={`https://testnet.snowtrace.io/address/${selectedNFT.creator}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {selectedNFT.creator}
              </a>
            </p>
            <p className="text-gray-600">
              <strong>Token Standard:</strong> ERC-721
            </p>
          </div>

          {/* Transfers Section */}
          
          </div>
        </div>
      </div>
  );
};

export default NFTModal;

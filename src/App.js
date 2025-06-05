import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [nftName, setNftName] = useState('');
  const [nftMetadata, setNftMetadata] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(contractInstance);

        console.log('✅ Contract connected:', contractInstance);
      } catch (err) {
        console.error('❌ Wallet connection error:', err);
      }
    } else {
      alert('Please install MetaMask.');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setContract(null);
  };

  const uploadToIPFS = async file => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios({
          method: 'POST',
          url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
          data: formData,
          headers: {
            pinata_api_key: '7abd11d3d3a427672b7c',
            pinata_secret_api_key:
              '2bcfc54fa64a2d441807c030837a8d84876e7e019bd732389e3b5f35c99fe7be',
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log("Image uploaded to Pinata:", response.data.IpfsHash);
        const CID = response.data.IpfsHash;// harsh / !url 
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${CID}`;// url => image ka url 
        console.log(ImgHash);
        return CID;
      } catch (error) {
        console.log('Unable to upload image to Pinata');
      }
    }
  };

  const pinJSONToIPFS = async (name, description, CID) => {
    try {
      const data = JSON.stringify({
        name: name,
        description: description,
        image: `https://gateway.pinata.cloud/ipfs/${CID}`,
      });
      const res = await fetch(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2NTNlOWJkNy05MTc1LTRlOGQtYTNkNi0zYjRlM2JlNGUxZjYiLCJlbWFpbCI6ImhhcHB5Ymlvc3RvY2tjb2RlMDcwNDBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjdhYmQxMWQzZDNhNDI3NjcyYjdjIiwic2NvcGVkS2V5U2VjcmV0IjoiMmJjZmM1NGZhNjRhMmQ0NDE4MDdjMDMwODM3YThkODQ4NzZlN2UwMTliZDczMjM4OWUzYjVmMzVjOTlmZTdiZSIsImV4cCI6MTc4MDY2MzY3MH0.UBtZf2buOGz6qKKUGK3gpoZbUdW-IsEB_Jx-gFeXQRA`,
          },
          body: data,
        }
      );
      const resData = await res.json();
      console.log('Metadata uploaded,CID:', resData.IpfsHash);
      return resData.IpfsHash;
    } catch (error) {
      console.log(error);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    if (!contract) return alert('Contract not connected.');
    if (!nftName || !nftMetadata || !imageFile) return alert('Fill all fields.');

    const imageUrl = await uploadToIPFS(imageFile);
    console.log('Image URL:', imageUrl);
    if (!imageUrl) return alert('Image upload failed.');

    const metadataCID = await pinJSONToIPFS(nftName, nftMetadata, imageUrl);
    console.log('Metadata URL:', metadataCID);
    const metadataurl = `https://gateway.pinata.cloud/ipfs/${metadataCID}`
    console.log("metadataurl", metadataurl)

  };

  return (
    <div className="App">
      <h1>ERC721 NFT Minter</h1>

      {walletAddress ? (
        <>
          <p>Connected Wallet: {walletAddress}</p>
          <button onClick={disconnectWallet}>Disconnect</button>

          <form onSubmit={handleMint} className="nft-form">
            <div>
              <label>NFT Name:</label>
              <input type="text" value={nftName} onChange={(e) => setNftName(e.target.value)} />
            </div>

            <div>
              <label>Description:</label>
              <textarea value={nftMetadata} onChange={(e) => setNftMetadata(e.target.value)} />
            </div>

            <div>
              <label>Image File:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>

            <button type="submit">Mint NFT</button>
          </form>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;

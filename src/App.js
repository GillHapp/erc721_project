import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error('User rejected connection or other error:', err);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  return (
    <div className="App">
      <h1>hello from the frontend</h1>
      {walletAddress ? (
        <>
          <p>Connected Wallet: {walletAddress}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;

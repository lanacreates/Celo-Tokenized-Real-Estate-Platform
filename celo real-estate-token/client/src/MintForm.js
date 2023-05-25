import { Buffer } from 'buffer';
import React, { Component } from 'react';
import Web3 from 'web3';
import ipfs from 'ipfs-api';
import RealEstateToken from './RealEstateToken.json';

const ipfsAPI = ipfs('ipfs.infura.io', '5001', { protocol: 'https' });

class MintForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      contract: null,
      web3: null,
      buffer: null,
      ipfsHash: '',
    };
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. Consider trying MetaMask!');
    }
    this.setState({ web3: window.web3 });
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = RealEstateToken.networks[networkId];
    if (networkData) {
      const contract = new web3.eth.Contract(RealEstateToken.abi, networkData.address);
      this.setState({ contract });
    } else {
      window.alert('RealEstateToken contract not deployed to detected network.');
    }
  }

  captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();

    reader.onloadend = () => {
      const buffer = Buffer.Buffer.from(reader.result);
      this.setState({ buffer });
    };

    reader.readAsArrayBuffer(file);
  };

  onSubmit = async (event) => {
    event.preventDefault();

    console.log('Submitting file to ipfs...');

    // Adding file to IPFS
    ipfsAPI.files.add(this.state.buffer, (error, result) => {
      if (error) {
        console.error(error);
        return;
      }

      // setting IPFS hash to the state
      this.setState({ ipfsHash: result[0].hash });

      console.log('IPFS result', result);
    });
  };

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <input type="file" onChange={this.captureFile} />
          <input type="submit" />
        </form>
      </div>
    );
  }
}

export default MintForm;

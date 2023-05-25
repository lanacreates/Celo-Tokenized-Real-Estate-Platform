import React, { Component } from 'react';
import { Buffer } from 'buffer';
import Web3 from 'web3';
import RealEstateToken from './RealEstateToken.json';
import MintForm from './MintForm';
import TokenList from './TokenList';
import SaleList from './SaleList';

global.Buffer = Buffer;



class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            account: '',
            contract: null,
            web3: null,
            tokens: []
        };
    }

    async componentDidMount() {
        await this.loadWeb3();
        await this.loadBlockchainData();
        await this.loadTokens();
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        }
        else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
        this.setState({ web3: window.web3 });
    }

    async loadBlockchainData() {
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        this.setState({ account: accounts[0] });
        const networkId = await web3.eth.net.getId();
        const networkData = RealEstateToken.networks[networkId];
        if(networkData) {
            const contract = new web3.eth.Contract(RealEstateToken.abi, networkData.address);
            this.setState({ contract });
        } else {
            window.alert('RealEstateToken contract not deployed to detected network.');
        }
    }

    async loadTokens() {
        const totalSupply = await this.state.contract.methods.totalSupply().call();
        let tokens = [];
        for (let i = 0; i < totalSupply; i++) {
            const tokenId = await this.state.contract.methods.tokenByIndex(i).call();
            const tokenURI = await this.state.contract.methods.tokenURI(tokenId).call();
            tokens.push({ tokenId, tokenURI });
        }
        this.setState({ tokens });
    }

    mintToken = async (uri, metadata) => {
        // implement mintToken logic here
    };

    listTokenForSale = async (tokenId, price) => {
        // implement listTokenForSale logic here
    };

    buyToken = async (tokenId) => {
        // implement buyToken logic here
    };

    render() {
        return (
            <div>
                <h1>Tokenized Real Estate Platform</h1>
                <MintForm
                    account={this.state.account}
                    contract={this.state.contract}
                    mintToken={this.mintToken}
                />
                <TokenList
                    account={this.state.account}
                    tokens={this.state.tokens}
                    contract={this.state.contract}
                    listTokenForSale={this.listTokenForSale}
                />
                <SaleList
                    account={this.state.account}
                    tokens={this.state.tokens}
                    contract={this.state.contract}
                    web3={this.state.web3}
                    buyToken={this.buyToken}
                />
            </div>
        );
    }
}

export default App;

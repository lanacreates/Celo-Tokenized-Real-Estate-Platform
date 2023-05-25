
import React, { Component } from "react";
import Web3 from "web3";
import RealEstateToken from "./RealEstateToken.json";
import SaleList from './SaleList';



class TokenList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            account: "",
            contract: null,
            web3: null,
            tokens: []
        };
        this.buyToken = this.buyToken.bind(this);
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

    async buyToken(tokenId) {
        const sale = await this.state.contract.methods.tokenSales(tokenId).call();
        this.state.contract.methods.buyToken(tokenId).send({ from: this.state.account, value: sale.askingPrice });
    }

    render() {
        return (
            <div>
                {this.state.tokens.map((token, key) => {
                    return (
                        <div key={key}>
                            <h3>Token ID: {token.tokenId}</h3>
                            <p>Token URI: {token.tokenURI}</p>
                            <SaleList
                                contract={this.state.contract}
                                web3={this.state.web3}
                                tokenId={token.tokenId}
                                buyToken={this.buyToken}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default TokenList;

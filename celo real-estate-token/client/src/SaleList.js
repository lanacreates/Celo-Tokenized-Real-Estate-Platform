
import React, { Component } from 'react';

class SaleList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sale: null
        };
    }

    async componentDidMount() {
        await this.loadSale();
    }

    async componentDidUpdate(prevProps) {
        if (this.props.tokenId !== prevProps.tokenId) {
            await this.loadSale();
        }
    }

    async loadSale() {
        const sale = await this.props.contract.methods.tokenSales(this.props.tokenId).call();
        if (sale.isForSale) {
            this.setState({ sale: { tokenId: this.props.tokenId, ...sale } });
        }
    }

    render() {
        return (
            <div>
                {this.state.sale &&
                    <div>
                        <p>Token ID: {this.state.sale.tokenId}</p>
                        <p>Asking Price: {this.props.web3.utils.fromWei(this.state.sale.askingPrice, 'ether')} CELO</p>
                        <button onClick={() => this.props.buyToken(this.state.sale.tokenId)}>Buy</button>
                    </div>
                }
            </div>
        );
    }
}

export default SaleList;

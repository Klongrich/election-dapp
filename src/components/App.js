import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3'
import Marketplace from '../abis/Marketplace.json'

class App extends Component {

  //Calls function when apps loads(life cycle)
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchaindata();
  }

  //Connecting to metaMask wallet
  async loadWeb3() {
      
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        await window.ethereum.enable()
      }
      else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
      }
      else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
  }

  //Function called to get data from the address / block-chain we are connected to
  async loadBlockchaindata() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})

    //conecting to the smart contract
    const networkID = await web3.eth.net.getId()
    const networkData = Marketplace.networks[networkID]
    
    if(networkData) {
      const abi = Marketplace.abi
      const address = Marketplace.networks[networkID].address
      const marketplace = web3.eth.Contract(abi, address)

      this.setState({ marketplace })

      const productCount = await marketplace.methods.productCount().call()
      this.setState({ productCount })
      // Load products
      for (var i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call()
        this.setState({
          products: [...this.state.products, product]
        })
      }
      this.setState({ loading: false})

    } else {
      window.alert('Marketplace contract not deployed to dectected network')
    }

  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true,
      marketplace: ''
    }

    this.purchaseProduct = this.purchaseProduct.bind(this)
    this.createProduct = this.createProduct.bind(this)
  }

  createProduct(name, price) {
    this.state.loading=({loading: true})
    this.state.marketplace.methods.createProduct(name, price).send({from: this.state.account})
    .once('receipt', (receipt) => {
      this.setState({loading: false})
    })
  }

  purchaseProduct(id, price) {
    this.setState({ loading: true })
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div id="content">
      <h1>Add Product</h1>
      <form onSubmit={(event) => {
        event.preventDefault()
        const name = this.productName.value
        const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'Ether')
        this.createProduct(name, price)
      }}>
        <div className="form-group mr-sm-2">
          <input
            id="productName"
            type="text"
            ref={(input) => { this.productName = input }}
            className="form-control"
            placeholder="Product Name"
            required />
        </div>
        <div className="form-group mr-sm-2">
          <input
            id="productPrice"
            type="text"
            ref={(input) => { this.productPrice = input }}
            className="form-control"
            placeholder="Product Price"
            required />
        </div>
        <button type="submit" className="btn btn-primary">Add Product</button>
      </form>
      <p>&nbsp;</p>
      <h2>Buy Product</h2>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Price</th>
            <th scope="col">Owner</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody id="productList">
          { this.state.products.map((product, key) => {
            return(
              <tr key={key}>
                <th scope="row">{product.id.toString()}</th>
                <td>{product.name}</td>
                <td>{window.web3.utils.fromWei(product.price.toString(), 'Ether')} Eth</td>
                <td>{product.owner}</td>
                <td>
                  { !product.purchased
                    ? <button
                        name={product.id}
                        value={product.price}
                        onClick={(event) => {
                          this.purchaseProduct(event.target.name, event.target.value)
                        }}
                      >
                        Buy
                      </button>
                    : null
                  }
                  </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
    );
  }
}

export default App;

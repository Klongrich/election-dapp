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
      loading: true
    }
  }

  render() {
    return (
      <div>
        <p> silk road </p>
        <p> Account: {this.state.account} </p>
      </div>
    );
  }
}

export default App;

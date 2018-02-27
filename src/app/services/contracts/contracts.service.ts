import {Injectable, OnInit} from '@angular/core';

declare let require: any;
declare let window: any;

var Web3 = require('web3');

let kyberNetworkAbi = require('./kyberNetwork.json');

@Injectable()
export class ContractsService {
  private _account: string = null;
  private _web3;

  private _kyberNetworkContract: any;
  private _kyberNetworkContractAddress: string = "0x0a56d8a49E71da8d7F9C65F95063dB48A3C9560B";

  constructor() {
    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      this._web3 = new Web3(window.web3.currentProvider);
      this._web3.eth.net.getId().then(netId => {
        if (netId !== 3) {
          alert('Please connect to the Ropsten network');
        }
      });
    } else {
      console.warn(
        'Please use a dapp browser like mist or MetaMask plugin for chrome'
      );
    }

    this._kyberNetworkContract = new this._web3.eth.Contract(kyberNetworkAbi, this._kyberNetworkContractAddress);
  }

  public async getAccount(): Promise<string> {
    if (this._account == null) {
      this._account = await new Promise((resolve, reject) => {
        this._web3.eth.getAccounts((err, accs) => {
          if (err != null) {
            alert('There was an error fetching your accounts.');
            return;
          }

          if (accs.length === 0) {
            alert(
              'Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.'
            );
            return;
          }
          resolve(accs[0]);
        })
      }) as string;

      this._web3.eth.defaultAccount = this._account;
    }

    return Promise.resolve(this._account);
  }

  public async getTokenBalance(tokenAddress): Promise<number> {
    let account = await this.getAccount();

    return new Promise((resolve, reject) => {
      this._kyberNetworkContract.methods.getBalance(tokenAddress, account).call().then(result => {
        resolve(this._web3.utils.fromWei(result));
      })
      .catch(err => {
        reject(err);
      });
    }) as Promise<number>;
  }

  public async getExpectedRate(srcToken, destToken, srcQty): Promise<number> {
    let account = await this.getAccount();
    const srcQtyWei = this._web3.utils.toWei(srcQty, 'ether');

    return new Promise((resolve, reject) => {
      this._kyberNetworkContract.methods.getExpectedRate(srcToken, destToken, srcQtyWei).call().then(result => {
        resolve(this._web3.utils.fromWei(result.expectedRate, 'ether'));
      })
      .catch(err => {
        reject(err);
      });
    }) as Promise<number>;
  }

  public trade(source, srcAmount, dest, destAddress, maxDestAmount, minConversionRate, throwOnFailure=false) {
    let account = this._account;
    const srcAmountWei = this._web3.utils.toWei(srcAmount, 'ether');
    //const gasPrice = await this._kyberNetworkContract.methods.trade(source, srcAmountWei, dest, destAddress, maxDestAmount, minConversionRate, throwOnFailure).estimateGas({from: account, gas: '1000000000'});

    return this._kyberNetworkContract.methods
      .trade(source, srcAmountWei, dest, destAddress, maxDestAmount, minConversionRate, throwOnFailure)
      .send({from: account, value: srcAmountWei, gasPrice: '1000000000', gas: '500000'})
  }
}

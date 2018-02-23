import {Injectable, OnInit} from '@angular/core';

import * as Web3 from 'web3';

declare let require: any;
declare let window: any;

let kyberNetworkAbi = require('./kyberNetwork.json');

@Injectable()
export class ContractsService {
  private _account: string = null;
  private _web3: any;

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

  private async getAccount(): Promise<string> {
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

  public async getUserBalance(): Promise<number> {
    let account = await this.getAccount();

    return new Promise((resolve, reject) => {
      //this._kyberNetworkContract.methods.getBalance(account).call().then(result => {
      this._web3.eth.getBalance(account).then(result => {
        resolve(this._web3.utils.fromWei(result));
      })
      .catch(err => {
        reject(err);
      });
    }) as Promise<number>;
  }

  public async trade(source, srcAmount, dest, destAddress, maxDestAmount, minConversionRate, throwOnFailure=false): Promise<number> {
    let account = await this.getAccount();

    //const gasPrice = await this._kyberNetworkContract.methods.trade(source, srcAmount, dest, destAddress, maxDestAmount, minConversionRate, throwOnFailure).estimateGas({from: account});
debugger;
    return new Promise((resolve, reject) => {
      this._kyberNetworkContract.methods.trade(source, srcAmount, dest, destAddress, maxDestAmount, minConversionRate, throwOnFailure).send({from: account, value: srcAmount, gas: '500000', gasPrice: '1000000000'}).then(result => {
        debugger;
        resolve(result);
      })
      .catch(err => {
        debugger;
        reject(err);
      });
    }) as Promise<any>;
  }
}

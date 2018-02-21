import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

import {ContractsService} from "./services/contracts/contracts.service";

export class Token {
  constructor(public name: string, public symbol: string, public address: string) { }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'kyber poc';
  balance = 0;
  tradeCtrl: FormControl;
  filteredTokens: Observable<any[]>;

  tokens: Token[] = [
    {
      name: "Ethereum",
      symbol: "ETH",
      address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    },
    {
      name: "KyberNetwork",
      symbol: "KNC",
      address: "0xa59826bfd12c6cddff70137a5f3e29b75215c531",
    },
    {
      name: "OmiseGO",
      symbol: "OMG",
      address: "0x98541419c0f9873acf6bf449cb7246f9df600d2c",
    },
    {
      name: "DigixDAO",
      symbol: "DGD",
      address: "0xe8c213a416646b5dfc04845d1b3e471b35599722",
    },
    {
      name: "Civic",
      symbol: "CVC",
      address: "0x5313256342e3b2a12188b91eee310f8311b8aa73",
    },
    {
      name: "FunFair",
      symbol: "FUN",
      address: "0xf96a8f7cd011a3cf2f2c8f5fdf8aaf0471ec3302",
    },
    {
      name: "Monaco",
      symbol: "MCO",
      address: "0xec8530552d545aa50668af7d75a96d9359d7388a",
    },
    {
      name: "Golem",
      symbol: "GNT",
      address: "0x4d46106343242999b7617e6c1a8f6d4927831582",
    },
    {
      name: "AdEx",
      symbol: "ADX",
      address: "0xf0de273c82a7eddd6057d963b848cd21309364bf",
    },
    {
      name: "TenX",
      symbol: "PAY",
      address: "0xa8f3612baea3998fee82673506189dc277eb8973",
    },
    {
      name: "BasicAttention",
      symbol: "BAT",
      address: "0xfe35c93a01af76dbe1116f13dd903578f340ab7d",
    },
    {
      name: "Eos",
      symbol: "EOS",
      address: "0x7d7fd73fede850a0d3f044af79ba83490830ae4b",
    },
    {
      name: "ChainLink",
      symbol: "LINK",
      address: "0xfab56a845dbb07f6ffdadf225713de8617e37d5c",
    }
  ];

  constructor(private cs: ContractsService) {
    this.tradeCtrl = new FormControl();
    this.filteredTokens = this.tradeCtrl.valueChanges
      .pipe(
        startWith(''),
        map(token => token ? this.filterTokens(token) : this.tokens.slice())
      );

    cs.getUserBalance().then(balance => this.balance = balance);
  }

  filterTokens(name: string) {
    return this.tokens.filter(token =>
      token.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  onTrade() {
    // hardcoding trade params for testing
    const source = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    const srcAmount = '10000000000000000'; // 0.01 ETH
    const dest = '0x98541419c0f9873acf6bf449cb7246f9df600d2c';
    const destAddress = '0x98541419c0f9873acf6bf449cb7246f9df600d2c';
    const maxDestAmount = '1'; // 1 OMG
    const minConversionRate = '48';
    const throwOnFailure = false;

    this.cs.trade(source, srcAmount, dest, destAddress, maxDestAmount, minConversionRate, throwOnFailure);
  }
}

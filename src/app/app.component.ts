import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import {ContractsService} from "./services/contracts/contracts.service";

export class Token {
  constructor(public name: string, public symbol: string, public address: string) { }
}

const MAX_UINT = 10**18;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'kyber poc';
  account = null;
  balance = 0;
  rate = 0;
  exchangeForm: FormGroup;
  filteredSrcTokens: Observable<any[]>;
  filteredDestTokens: Observable<any[]>;

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

  constructor(private fb: FormBuilder, private cs: ContractsService) {
    this.exchangeForm = fb.group({
      'srcToken': ['Ethereum', Validators.required],
      'srcTokenQty': [0, Validators.required],
      'destToken': ['KyberNetwork', Validators.required],
      'destTokenQty': [0, Validators.required],
    });

    // subscribe to autocomplete changes
    this.filteredSrcTokens = this.filterTokensSubscribe('srcToken');
    this.filteredDestTokens = this.filterTokensSubscribe('destToken');

    // subscribe to form input changes
    this.exchangeForm.valueChanges
      .debounceTime(1000)
      .distinctUntilChanged()
      .subscribe(val => {
        const { srcToken, destToken, srcTokenQty } = val;
        const srcToken = this.tokens.find(token => token.name === val.srcToken).address;
        const destToken = this.tokens.find(token => token.name === val.destToken).address;
        const srcAmount = this.exchangeForm.value.srcTokenQty;
        this.cs.getExpectedRate(srcToken, destToken, parseInt(srcTokenQty)).then(result => {
          this.rate = result;
        });
      });
  }

  async ngOnInit(): void {
    this.account = await this.cs.getAccount();
    this.balance = await this.cs.getUserBalance();
  }

  filter(name) {
    return this.tokens.filter(token =>
      token.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterTokensSubscribe(formControlName: string) {
    return this.exchangeForm.get(formControlName).valueChanges
      .pipe(
        startWith(''),
        map(token => token ? this.filter(token) : this.tokens.slice())
      );
  }

  onTrade() {
    const source = this.tokens.find(token => token.name === this.exchangeForm.value.srcToken).address;
    const srcAmount = this.exchangeForm.value.srcTokenQty;
    const dest = this.tokens.find(token => token.name === this.exchangeForm.value.destToken).address;
    const destAddress = this.account; // default user account
    const maxDestAmount = MAX_UINT;
    const minConversionRate = '1'; // 1=market rate
    const throwOnFailure = false;

    this.cs.trade(source, srcAmount, dest, destAddress, maxDestAmount, minConversionRate, throwOnFailure);
  }
}

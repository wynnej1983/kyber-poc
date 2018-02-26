import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import {MatSnackBar} from '@angular/material';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import {ContractsService} from "./services/contracts/contracts.service";
import tokens, {Token} from "./tokens";

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
  totalBalance = 0;
  srcTokenBalance = 0;
  rate = 0;
  txHash = null;
  exchangeForm: FormGroup;
  filteredSrcTokens: Observable<Token[]>;
  filteredDestTokens: Observable<Token[]>;

  
  constructor(private fb: FormBuilder, private cs: ContractsService, public _DomSanitizer: DomSanitizer, public snackBar: MatSnackBar) {
    this.exchangeForm = fb.group({
      'srcToken': [tokens[0], Validators.required],
      'srcTokenQty': ['0', Validators.required],
      'destToken': [tokens[1], Validators.required],
      'destTokenQty': ['0', Validators.required],
    });

    // subscribe to autocomplete changes
    this.filteredSrcTokens = this.filterTokensSubscribe('srcToken');
    this.filteredDestTokens = this.filterTokensSubscribe('destToken');

    // subscribe to form input changes
    this.exchangeForm.valueChanges
      .debounceTime(1000)
      .distinctUntilChanged()
      .subscribe(val => {
        this.getSrcTokenBalance(val);
        this.getExpectedRate(val);
        this.exchangeForm.controls['destTokenQty'].setValue(val.srcTokenQty * this.rate);
      });
  }

  async ngOnInit(): void {
    this.account = await this.cs.getAccount();
    this.getSrcTokenBalance(this.exchangeForm.value);
    this.getExpectedRate(this.exchangeForm.value);
  }

  displayFn(token?: Token): string | undefined {
    return token ? token.symbol : undefined;
  }

  filterTokensSubscribe(formControlName: string) {
    return this.exchangeForm.get(formControlName).valueChanges
      .pipe(
        startWith<string | Token>(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this.filter(name) : tokens.slice())
      );
  }

  filter(name) {
    return tokens.filter(token =>
      token.name.toLowerCase().indexOf(name.toLowerCase()) === 0 ||
      token.symbol.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  getSrcTokenBalance(exchangeForm) {
    const srcToken = tokens.find(token => token.symbol === exchangeForm.srcToken.symbol);
    if (srcToken) {
      this.cs.getTokenBalance(srcToken.address).then(result => {
        this.srcTokenBalance = parseFloat(result).toFixed(6);
      });
    }
  }

  getExpectedRate(exchangeForm) {
    const srcToken = tokens.find(token => token.symbol === exchangeForm.srcToken.symbol);
    const destToken = tokens.find(token => token.symbol === exchangeForm.destToken.symbol);
    const quantity = exchangeForm.srcTokenQty;
    if (srcToken && destToken) {
      this.cs.getExpectedRate(srcToken.address, destToken.address, quantity).then(result => {
        this.rate = parseFloat(result).toFixed(4);
      });
    }
  }

  onTrade() {
    const source = tokens.find(token => token.symbol === this.exchangeForm.value.srcToken.symbol).address;
    const srcAmount = this.exchangeForm.value.srcTokenQty;
    const dest = tokens.find(token => token.symbol === this.exchangeForm.value.destToken.symbol).address;
    const destAddress = this.account; // default user account
    const maxDestAmount = MAX_UINT;
    const minConversionRate = '1'; // 1=market rate
    const throwOnFailure = false;

    this.cs.trade(source, srcAmount, dest, destAddress, maxDestAmount, minConversionRate, throwOnFailure)
      .once('transactionHash', txHash => {
        console.log(txHash);
        this.txHash = txHash;
        /*
        this.snackBar.open('Transaction ' + txHash + 'being mined', 'Dismiss', {
          duration: 5000,
        });
       */
      })
      .once('receipt', receipt => {
        console.log('---RECEIPT---');
        console.log(receipt);
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        console.log('---CONFIRMATION---');
        console.log(confirmationNumber);
      })
      .on('error', console.log)
      .then(result => {
        console.log('---DONE---');
        console.log(result);
        this.txHash = null;
        /*
        this.snackBar.open('Done!', 'Dismiss', {
          duration: 5000,
        });
       */
      })
  }
}

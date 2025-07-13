import { Component, OnInit, Input } from '@angular/core';
import { CommissionBrokerProduct } from '../../../shared/models/commission-broker-product';
import { CommissionHeader } from '../../models/commission-header';

@Component({
  selector: 'commission-product-release',
  templateUrl: './commission-product-release.component.html',
  styleUrls: ['./commission-product-release.component.css']
})
export class CommissionProductReleaseComponent implements OnInit {
 products: CommissionBrokerProduct[]=[];
  selectedApprovedPaymentIds: number[] = [];
  selectedWithHeldPaymentIds: number[] = [];
  countItems = 0;
  constructor() { }
  ngOnInit() {
    this.loadTestProducts();
  }
  loadTestProducts() {
 
    this.products.push(new CommissionBrokerProduct(1,"product 1 test",false, new Date("2020-12-13")));
    this.products.push(new CommissionBrokerProduct(2,"product 2 test",true, new Date("2020-02-23")));
    this.products.push(new CommissionBrokerProduct(3,"product 3 tst",false, new Date("2020-01-22")));
    this.products.push(new CommissionBrokerProduct(4,"product 4 xyte",false, new Date("2020-09-15")));
    this.products.push(new CommissionBrokerProduct(5,"product 5 xyte",false, new Date("2020-09-15")));
 this.products.push(new CommissionBrokerProduct(6,"product 6 xyte",false, new Date("2020-09-15")));
  }

  onSelectRelease(event : any){}
}

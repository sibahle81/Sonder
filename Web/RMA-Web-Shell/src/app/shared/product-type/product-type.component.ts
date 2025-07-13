import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ProductType } from 'projects/fincare/src/app/payment-manager/models/ProductType';


@Component({
  selector: 'app-product-type',
  templateUrl: './product-type.component.html',
  styleUrls: ['./product-type.component.css']
})
export class ProductTypeComponent implements OnInit {

  productTypes: ProductType[] =
    [
      new ProductType(0, 'All'),
      new ProductType(1, 'Corporate'),
      new ProductType(2, 'Goldwage'),
      new ProductType(3, 'Group'),
      new ProductType(4, 'Individual')
    ];

  selectedProductType: number;

  @Output() onSelectedProductChanged = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
    this.selectedProductType = this.productTypes[0].id;
  }

  productTypeChanged(){
    this.onSelectedProductChanged.emit(this.selectedProductType)
  }

}

import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ForecastRate } from '../../../../shared/forecast-rate';
import { ForecastRateService } from '../../../../shared/forecast-rate.service';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';

@Component({
  selector: 'app-add-forecast-rate',
  templateUrl: './add-forecast-rate.component.html',
  styleUrls: ['./add-forecast-rate.component.css']
})
export class AddForecastRateComponent implements OnInit {
  forecastRates: ForecastRate[];
  isMinSalaryVal = false;
  isMaxSalaryVal = false;
  products: Product[];
  selectProducts: Product[] = [];
  form: UntypedFormGroup;
  public startDate = new Date();
  
  constructor(public dialogRef: MatDialogRef<AddForecastRateComponent>,
             private readonly formBuilder: UntypedFormBuilder,
             private readonly productService: ProductService,
              @Inject(MAT_DIALOG_DATA) public data: ForecastRate,
              public forecastRateService: ForecastRateService) { }

  ngOnInit() {
   
    this.createForm(0);
    this.loadProducts();
    // this.forecastRateService.getHistory().subscribe(results=>{
    //    this.forecastRates = results;

    // });
  }

  createForm(id: any): void {
    this.startDate.setHours(0, 0, 0, 0);
    this.form = this.formBuilder.group({
        id,
        forecastRate: new UntypedFormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
        productId: new UntypedFormControl('', [Validators.required, Validators.min(0)]),
        startDate: new UntypedFormControl(this.startDate, Validators.required)
    });
}

  loadProducts(): void {
    this.productService.getProducts().subscribe(
      data => {
        this.products = data.sort(this.comparer);
        this.products.unshift(this.getOperationalProduct());
        this.selectProducts = this.products;
      }
    );
  }

  comparer(a: any, b: any): number {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0;
  }

  getOperationalProduct(): Product {
    const product = new Product();
    product.id = null;
    product.name = '- No product -';
    return product;
  }
  
  startDateChange(value: Date) {
    this.startDate = value;
}

  submit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public confirmAdd(): void {

    this.data.effectiveFrom = this.form.get('startDate').value;
    this.data.effectiveTo = new Date();
    this.data.effectiveTo.setHours(0,0,0,0);
    this.data.effectiveTo.setFullYear( new Date().getFullYear() + 1,11,31);
    this.data.productId = this.form.get('productId').value;
    this.data.forecastRate = this.form.get('forecastRate').value;
    this.forecastRateService.addRate(this.data);
  }
}

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css']
})
export class ProductFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  products: Product[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly productService: ProductService
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.productService.getProducts().subscribe(results => {
      this.products = results;
      this.createForm();
      this.isLoading$.next(false)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      product: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const product = this.form.controls.product.value;

    if (product) {
      const parameters = [{ key: 'ProductId', value: product != 'all' ? product.id : product }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        product: 'all'
      });
    }
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}

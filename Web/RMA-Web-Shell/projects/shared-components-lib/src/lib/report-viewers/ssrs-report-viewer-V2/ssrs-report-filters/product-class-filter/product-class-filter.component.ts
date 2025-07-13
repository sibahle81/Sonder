import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';

@Component({
  selector: 'product-class-filter',
  templateUrl: './product-class-filter.component.html',
  styleUrls: ['./product-class-filter.component.css']
})
export class ProductClassFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  productClasses: ProductClassEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.productClasses = this.ToArray(ProductClassEnum);
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      productClass: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const productClass = this.form.controls.productClass.value;

    if (productClass) {
      const parameters = [{ key: 'ProductClassId', value: productClass != 'all' ? +ProductClassEnum[productClass] : productClass }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        productClass: 'all'
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

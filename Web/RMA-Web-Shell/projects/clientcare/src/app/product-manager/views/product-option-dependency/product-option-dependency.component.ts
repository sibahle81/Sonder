import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/dialog/dialog.component';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../../models/product';
import { ProductOption } from '../../models/product-option';
import { ProductOptionDependency } from '../../models/product-option-dependency';
import { ProductOptionService } from '../../services/product-option.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'product-option-dependency',
  templateUrl: './product-option-dependency.component.html',
  styleUrls: ['./product-option-dependency.component.css']
})
export class ProductOptionDependencyComponent implements OnInit {

  @Input() productOption = new ProductOption();
  @Input() isWizard = false;
  @Input() isReadOnly = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  form: UntypedFormGroup;
  hideForm = true;

  defaultCheck = false;

  products: Product[];
  industryClasses: Lookup[] = [];
  public selectedProduct: number;
  public selectedClass: number;
  productOptions: ProductOption[];
  filteredProductOptions: ProductOption[];
  filteredProduct: Product[];
  selectedProductObject: Product;
  filteredindustryClasses: Lookup[] = [];
  errorMessage: string;

  ngOnInit(): void {
    this.onLoadLookups();
  }

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly productOptionService: ProductOptionService,
    private readonly productService: ProductService,
    public dialog: MatDialog,
    readonly alertService: AlertService

  ) {
  }

  onLoadLookups(): void {
    this.getProducts();
    this.getIndustryClasses();
    this.getProductOptions();
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
        product: [{ value: null, disabled: this.isReadOnly  }],
        productOption: [{ value: null, disabled: this.isReadOnly  }],
        industryClass: [{ value: null, disabled: this.isReadOnly  }],
        childPremiumPercentage: [{ value: null, disabled: this.isReadOnly  }],
        quoteAutoAcceptParentAccount: [{value: this.defaultCheck, disabled: this.isReadOnly   }]
    });
  }

  getIndustryClasses() {
    this.lookupService.getIndustryClasses().subscribe(data => {
      this.industryClasses = data;
      this.filteredindustryClasses = data.slice();
    });

  }

  getProducts() {
      this.productService.getProducts().subscribe(results => {
        this.products = results;
        this.filteredProduct = results;
      });
  }

  getProductOptions() {
    this.productOptionService.getProductOptionsWithDependencies().subscribe(results => {
      this.productOptions = results;
      this.filteredProductOptions = this.productOptions.slice();
      if (this.productOption && this.productOption.productOptionDependencies?.length > 0){
        this.productOption.productOptionDependencies.forEach(x => {
          let index =  this.filteredProductOptions.findIndex(y => y.id === x.childOptionId);
          if (index > -1){
            this.filteredProductOptions.splice(index, 1);
            index = -1;
          }
          index = this.filteredindustryClasses.findIndex(y => y.id === x.industryClass);

          if (index > -1){
            this.filteredindustryClasses.splice(index, 1);
          }
        });
      }

      this.createForm();
      this.isLoading$.next(false);
    });
  }

  addDependency(){

    const newDependency = new ProductOptionDependency();
    newDependency.productOptionId = this.productOption.id;
    newDependency.childOptionId = this.form.controls.productOption.value ;
    newDependency.industryClass = this.form.controls.industryClass.value;
    newDependency.childPremiumPecentage = this.form.controls.childPremiumPercentage.value;
    newDependency.quoteAutoAcceptParentAccount = this.defaultCheck;

    if (!this.form.controls.productOption.value || !this.form.controls.industryClass.value ||
      !this.form.controls.product.value || !this.form.controls.childPremiumPercentage.value)
    {
      this.errorMessage = 'Please make sure that all fields are supplied';
    }
    else  {
      if (this.productOption.productOptionDependencies && this.productOption.productOptionDependencies.length > 0 ){

        if (this.productOption.productOptionDependencies.filter(value => value.productOptionId === newDependency.productOptionId &&
          value.childOptionId === newDependency.childOptionId &&
          value.childPremiumPecentage === newDependency.childPremiumPecentage &&
          value.industryClass === newDependency.industryClass && value.quoteAutoAcceptParentAccount === newDependency.quoteAutoAcceptParentAccount).length > 0)
          {
            this.errorMessage = 'This dependency has already been added';
            return;
          }
      }
      if (!this.productOption.productOptionDependencies) {
        this.productOption.productOptionDependencies = [];
    }
      this.productOption.productOptionDependencies.push(newDependency);
      let index =  this.filteredProductOptions.findIndex(x => x.id === newDependency.childOptionId);
      if (index > -1){
        this.filteredProductOptions.splice(index, 1);
        index = -1;
      }

      index = this.filteredindustryClasses.findIndex(x => x.id === newDependency.industryClass);
      if (index > -1){
        this.filteredindustryClasses.splice(index, 1);
      }

      this.reset(true);
    }

  }

  deleteSelectedProduct(product: ProductOptionDependency){
    const question = `Are you sure you want to delete this item?`;
    const hideCloseBtn = true;
    const dialogRef = this.dialog.open(DialogComponent, {
    width: '500px',
    data: { question, hideCloseBtn }
    });

    dialogRef.afterClosed().subscribe(response => {
        if (response !== null) {
          const index = this.productOption.productOptionDependencies.findIndex(s => s.productOptionId === product.productOptionId);
          if (index > -1)
          {
            this.hideForm = true;
            this.productOption.productOptionDependencies.splice(index, 1);
            this.filteredindustryClasses = this.industryClasses.slice();
            this.reset(false);
          }
        }
    });
  }

  productSelected(product: Product) {
  this.selectedProductObject = product;
  this.filteredProductOptions = this.productOptions.filter(s => s.productId === product.id);
  }

  toggleForm() {
    this.hideForm = !this.hideForm;
  }

  reset(toggleForm: boolean){
    if (toggleForm){
      this.toggleForm();
    }
    this.form.controls.productOption.reset();
    this.form.controls.industryClass.reset();
    this.form.controls.product.reset();
    this.form.controls.childPremiumPercentage.reset();
    this.defaultCheck = false;
    this.errorMessage = '';
  }

  onCheckboxChange($event: MatCheckboxChange){
    this.defaultCheck = $event.checked;
  }

  addNewDependency(){
    this.toggleForm();
  }

  cancel() {
    this.reset(true);
  }

  getIndustryClassString(industryClass: IndustryClassEnum): string {
    return IndustryClassEnum[industryClass];
  }

  getChildOptionString(childOption: number): string {
    const childOptionName = this.productOptions.find(x => x.id === childOption).name;
    return childOptionName;
  }


}

import { Component, ViewChild } from '@angular/core';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ActivatedRoute } from '@angular/router';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { Brokerage } from '../../models/brokerage';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Product } from '../../../product-manager/models/product';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { BrokerageProductOption } from '../../models/brokerage-product-option';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BrokerItemTypeEnum } from '../../models/enums/broker-item-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../../product-manager/services/product.service';

@Component({
  selector: 'brokerage-product-options',
  templateUrl: './brokerage-product-options.component.html',
  styleUrls: ['./brokerage-product-options.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: MatDatePickerDateFormat
    },
    {
      provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat
    }
  ]
})
export class BrokerageProductOptionsComponent extends WizardDetailBaseComponent<Brokerage> {

  firstName: string;
  displayName: string;
  step: string;
  isWizard: boolean;
  singleDataModel = true;
  isNew = true;
  brokerage: Brokerage;
  brokerages: Brokerage[];
  productOptions: ProductOption[];
  products: Product[];
  displayedColumns: string[] = ['select', 'product', 'name', 'description', 'startDate', 'endDate', 'actions'];
  dataSource = new MatTableDataSource<BrokerageProductOption>();
  selection = new SelectionModel<BrokerageProductOption>(true, []);
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  rowCount: number;
  selectedProductOptions: BrokerageProductOption[] = [];
  currentQuery: string;
  selectedProductOptionsIds: number[] = [];
  pagesWithSelectAll: number[] = [];
  product = new Product();
  loadingProducts = false;
  loadingProductOptions = false;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  errors = [];
  canBackDate: boolean;
  minDate: Date;
  productForm: UntypedFormGroup;
  selectedProductId: number = -1;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly productOptionService: ProductOptionService,
    private readonly productService: ProductService,
    private readonly lookupService: LookupService,
    public dialog: MatDialog
  ) {
    super(appEventsManager, authService, activatedRoute); 
    this.createProductForm();
  }

  onLoadLookups() {
    // no lookups
  }

  populateModel(): void {    
    this.model.brokerageProductOptions = this.selectedProductOptions;
    this.selectedProductOptionsIds = [];
    this.selectedProductOptions.forEach(c => this.selectedProductOptionsIds.push(c.productOptionId));
    this.model.productOptionsIds = this.selectedProductOptionsIds;
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: [id]
    });
  }

  createProductForm(): void {
    this.productForm = this.formBuilder.group({
      product: ['']
    });
  }

  populateForm(): void {
    if (this.model.brokerageProductOptions) {
      this.selectedProductOptions = this.model.brokerageProductOptions;
      this.dataSource.data = this.model.brokerageProductOptions;
      this.selectedProductOptionsIds = [];
      this.selectedProductOptions.forEach(c => { this.selectedProductOptionsIds.push(c.productOptionId); });
      this.model.productOptionsIds = this.selectedProductOptionsIds;
    }

    if (!this.isDisabled && this.model.id > 0) {
      this.loadProducts();
      this.loadProductOptions(this.selectedProductOptions, this.pagesWithSelectAll);
    }

    this.checkForErrors();
  }

  disable(): void {
    this.isDisabled = true;
    this.productForm.disable();
    this.form.disable();
  }

  enable(): void {
    this.isDisabled = false;
    this.productForm.enable();
    this.form.enable();
  }

  checkForErrors(): void {
    this.errors = [];
    
    if (this.model.productOptionsIds === undefined || this.model.productOptionsIds.length === 0) {
      this.errors.push('No product options added');
    }

    this.selectedProductOptions.forEach(
      po => {
        if (!po.startDate) {
          this.errors.push(`Start date for ${po.productOption.description ?? po.productOption.name} is blank`);
        } else if (po.endDate) {
          if (this.getDate(po.startDate) > this.getDate(po.endDate)) {
            this.errors.push(`End date for ${po.productOption.description ?? po.productOption.name} is before the start date`);
          }
        }
      }
    );
  }

  getDate(dtm: any): number {
    const date = new Date(dtm);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    this.checkForErrors();
    validationResult.errorMessages = this.errors;
    validationResult.errors = this.errors.length;
    return validationResult;
  }

  loadProducts() {
    this.loadingProducts = true;

    this.productService.getProducts().subscribe(result => {
      if (result) {
        this.products = result;
        this.loadingProducts = false;
      }
    });
  }

  loadProductOptions(selectedtOptions: BrokerageProductOption[], pgsWithSelectAll: number[]) {
    this.loadingProductOptions = true;
    const sortDirection = this.sort.direction ? this.sort.direction : 'asc';
    
    const brokerageId = this.model.id.toString();
    const productId = this.selectedProductId.toString();
    this.currentQuery = `brokerageId=${brokerageId}&productId=${productId}`;

    this.productOptionService.getBrokerProductOptionsByProductIdPaged(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, sortDirection, this.currentQuery)
      .subscribe(result => {
        if (result.data) {

          this.productOptions = result.data;
          this.productOptions.forEach(c => { c.startDate = null; c.endDate = null; });

          this.maintainState(selectedtOptions, pgsWithSelectAll);
          this.dataSource.data = this.buildBrokerageProductOptions(this.productOptions);

          if (selectedtOptions.length > 0) {
            selectedtOptions.forEach(c => {
              const datasourceOptionItem = this.dataSource.data.find(d => d.productOptionId === c.productOptionId);
              if (datasourceOptionItem) {
                datasourceOptionItem.startDate = c.startDate;
                datasourceOptionItem.endDate = c.endDate;
              }
            });
          }
          this.rowCount = result.rowCount;
          this.loadingProductOptions = false;
        }
      });
  }

  maintainState(selectedtOptions: BrokerageProductOption[], pgsWithSelectAll: number[]) {
    this.selectedProductOptionsIds = [];
    this.pagesWithSelectAll = [];

    this.selectedProductOptions = selectedtOptions;
    this.pagesWithSelectAll = pgsWithSelectAll;
    this.selectedProductOptions.forEach(c => this.selectedProductOptionsIds.push(c.productOptionId));
  }

  addProductOption(event: any, option: BrokerageProductOption) {
    this.selectedProductOptionsIds = [];
    let index = -2;
    this.selectedProductOptions.forEach((element, i) => {
      if (element.productOptionId === option.productOptionId) {
        index = i;
      }
    });
    if (event.checked) {
      if (index < 0) {
        this.selectedProductOptions.push(option);
      }
    } else if (index > -1) {
      this.selectedProductOptions.splice(index, 1);
    }
    this.selectedProductOptions.forEach(c => this.selectedProductOptionsIds.push(c.productOptionId));
    // We need to make sure that the select all is no longer on for this page if it was there before
    const pageIndex = this.pagesWithSelectAll.findIndex(c => c === this.paginator.pageIndex);
    if (pageIndex > -1) {
      this.pagesWithSelectAll.splice(pageIndex, 1);
    }
    this.checkForErrors();
  }

  onPaginateChange() {
    this.loadProductOptions(this.selectedProductOptions, this.pagesWithSelectAll);
  }
 
  validateProductOptionStartDate(option: BrokerageProductOption, val: Date, event: any): void {
    
    const startDate = val;
    const effectiveStartDate = new Date(this.model.startDate);
    if (startDate && startDate < effectiveStartDate) {
      this.errors.push(`Start date for (${option.productOption.description}) cannot be before the FSP CONTRACT start date.`);
    }

    let bfound = false;
    this.selectedProductOptions.forEach((element, i) => {
      if (element.productOptionId === option.productOptionId) {
        bfound = true;
      }
    });

    if (bfound === false) {
      this.selectedProductOptions.push(option);
    }

    this.selectedProductOptions.forEach((element, i) => {
      if (element.productOptionId === option.productOptionId) {
        element.productOption.startDate = startDate;
        element.startDate = startDate;
      }
    });

    this.checkForErrors();
  }

  validateProductOptionEndDate(option: BrokerageProductOption, val: Date, event: any): void {
    const endDate = val;
    const isValid = true;
    if (isValid) {
      this.selectedProductOptions.forEach((element, i) => {
        if (element.productOptionId === option.productOptionId) {
          element.productOption.endDate = endDate;
          element.endDate = endDate;
        }
      });
    }
    this.checkForErrors();
  }

  getDateFormattedDate(dt: Date): string {
    if (!dt) { return ''; }
    const dtm = new Date(dt);
    const month = `${dtm.getMonth() + 1}`.padStart(2, '0');
    const date = `${dtm.getDate()}`.padStart(2, '0');
    return `${dtm.getFullYear()}-${month}-${date}`;
  }

  buildBrokerageProductOptions(productOptions: ProductOption[]): BrokerageProductOption[] {
    const brokerageProdOptions: BrokerageProductOption[] = [];
    productOptions.forEach((c: ProductOption) => {
      brokerageProdOptions.push(new BrokerageProductOption(0, this.model.id, c.id, c.startDate, c.endDate, c));
    });
    return brokerageProdOptions;
  }

  onProductSelectionChange($event: any ) {
    this.selectedProductId = $event.value;
    this.paginator.pageIndex = 0
    this.loadProductOptions(this.selectedProductOptions, this.pagesWithSelectAll);
  }

  openAuditDialog(productOption: BrokerageProductOption) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.BrokerageManager,
        clientItemType: BrokerItemTypeEnum.BrokerageProductOption,
        itemId: productOption.id,
        heading: 'Brokerage Contract Options Details Audit',
        propertiesToDisplay: [ 'Id', 'BrokerageId', 'ProductOptionId', 'StartDate', 'EndDate' ]
      }
    });
  }
}

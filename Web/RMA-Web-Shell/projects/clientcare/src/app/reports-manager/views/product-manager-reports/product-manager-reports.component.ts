import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ProductService } from '../../../product-manager/services/product.service';
import { Product } from '../../../product-manager/models/product';

@Component({
  selector: 'app-product-manager-reports',
  templateUrl: './product-manager-reports.component.html',
  styleUrls: ['./product-manager-reports.component.css']
})
export class ProductManagerReportsComponent implements OnInit {

  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string; 
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  formatAudit = 'PDF';
  reportTitle: string;
  ssrsBaseUrl: string;

  startDate: Date;
  startMaxDate: Date;
  endMinDate: Date;

  endDate: Date;
  start: any;
  end: any;
  exportTypeName = 'CSV';
  dateError = '';
  form: UntypedFormGroup;
  products: UntypedFormControl;
  showReport = false;
  showExport = false;
  reportFilter = null;
  productList: any[];
  productItem: Product;
  public selectedReportType: any;
  public productReportTypes = [
    { name: 'Product Benefits Report', value: 'RMAProductBenefitsReport' },
    { name: 'Product Options Report', value: 'RMAProductOptionsReport' },
    { name: 'Monthly Membership Report', value: 'RMAMonthlyMembershipReport' }
  ];

  constructor(
    public datePipe: DatePipe,
    private lookupService: LookupService,
    private productService: ProductService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.productItem = new Product();
    this.productService.getProducts().subscribe(products => {
      this.productList = this.sortProducts(products);
    });

    if (this.selectedReportType === undefined) {
      this.selectedReportType = this.productReportTypes.filter(i => i.value === 'RMAProductBenefitsReport')[0];
    }
    this.reportTitle = this.selectedReportType.name;

    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      value => {
        this.ssrsBaseUrl = value;
        this.loadDefaultReport();
      }
    );
    this.showExport = false;
  }

  createForm(): void {
    this.form = new UntypedFormGroup({
      products: new UntypedFormControl(''),
    });
  }

  productChanged($event: any) {
    this.productItem = $event.value;
  }

  sortProducts(products) {
    const sortedProducts = products.sort((a, b) => {
      if (a.name.toUpperCase() < b.name.toUpperCase()) { return -1; }
      if (a.name.toUpperCase() > b.name.toUpperCase()) { return 1; }
      return 0;
    });
    return sortedProducts;
  }

  getSortedProductTypes() {
    return this.productReportTypes.sort((a, b) => {
      if (a.name.toUpperCase() < b.name.toUpperCase()) { return -1; }
      if (a.name.toUpperCase() > b.name.toUpperCase()) { return 1; }
      return 0;
    });
  }

  checkEndDate(control: UntypedFormControl): { [s: string]: boolean } {
    if (this.start < this.end) {
      return { endDateValidate: true };
    }
    return null;
  }

  startDateChange(value: Date) {
    this.startDate = new Date(value);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
  }

  endDateChange(value: Date) {
    this.endDate = new Date(value);
    this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate() + 1);
    this.end = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
  }


  productReportTypeChanged($event: any) {
    this.selectedReportType = this.productReportTypes.filter(i => i.value === $event.value.value)[0];
    this.reportTitle = this.selectedReportType.name;

  }

  ExportTypeChanged($event: any) {
    console.log($event);

    switch ($event.value) {
      case 1: {
        this.formatAudit = 'PDF';
        break;
      }
      case 2: {
        this.formatAudit = 'CSV';
        break;
      }
      case 3: {
        this.formatAudit = 'EXCEL';
        break;
      }
      default: {
        // statements;
        break;
      }
    }
  }

  loadDefaultReport(): void {
    this.showReport = false;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.Common/Placeholder';
    this.showParametersAudit = 'false';
    this.parametersAudit = { default: true };
    this.languageAudit = 'en-us';
    this.widthAudit = 50;
    this.heightAudit = 50;
    this.toolbarAudit = 'false';
  }

  viewReport() {
    if (this.productItem !== null) {
      this.reportFilter = this.productItem.name;
    } else {
      this.reportFilter = null;
    }
    this.showExport = true;
    this.dateError = '';
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.ClientCare/' + this.selectedReportType.value;
    this.parametersAudit = { ProductName: this.reportFilter };
    this.showParametersAudit = 'false';
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'true';
    console.log('loading report');
    this.showReport = true;
    this.showExport = true;
  }

  exportReport() {
    if (this.productItem !== null) {
      this.reportFilter = this.productItem.name;
    } else {
      this.reportFilter = null;
    }
    this.dateError = '';
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.ClientCare/' + this.selectedReportType.value;
    this.parametersAudit = { ProductName: this.reportFilter };
    this.showParametersAudit = 'false';
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'true';
    console.log('Export report');
    this.showReport = true;
  }

}

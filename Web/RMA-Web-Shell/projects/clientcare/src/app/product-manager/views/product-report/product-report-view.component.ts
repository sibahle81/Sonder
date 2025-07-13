import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbProductService } from '../../services/breadcrumb-product.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'product-report',
  templateUrl: './product-report-view.component.html',

})
export class ProductReportComponent implements OnInit {

  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  reportTitle: string;
  ssrsBaseUrl: string;

  productid: number;

  startDt: UntypedFormControl;
  endDt: UntypedFormControl;
  showReport = false;

  public funeralClaimReportTypes = [
    { name: 'Product Report', value: 'ProductVewOne' }
  ];
  public selectedReportType: any;

  constructor(
    public datePipe: DatePipe,
    private lookupService: LookupService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly privateAppEventsManager: AppEventsManager,
    private readonly breadCrumbService: BreadcrumbProductService) {
  }

  ngOnInit() {
    if (this.selectedReportType === undefined) {
      this.selectedReportType = this.funeralClaimReportTypes.filter(i => i.value === 'ProductVewOne')[0];
    }
    this.reportTitle = this.selectedReportType.name;
    this.breadCrumbService.setBreadcrumb('View Product');

    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
      this.loadDefaultReport();
      this.activatedRoute.params.subscribe((params: any) => {
        this.privateAppEventsManager.loadingStop();
        if (params.id) {
          this.productid = params.id;
          this.searchData();
        }
      });
    });
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

  searchData() {
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.ClaimCare/' + this.selectedReportType.value;
    this.parametersAudit = { ProductId: this.productid };
    this.showParametersAudit = 'false';
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'true';
    this.showReport = true;
  }
}

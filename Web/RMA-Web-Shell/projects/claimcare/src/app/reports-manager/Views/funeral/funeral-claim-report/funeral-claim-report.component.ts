import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UntypedFormControl, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { BrokerageService } from 'projects/clientcare/src/app/broker-manager/services/brokerage.service';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';

@Component({
  selector: 'app-funeral-claim-report',
  templateUrl: './funeral-claim-report.component.html',
  styleUrls: ['./funeral-claim-report.component.css']
})
export class FuneralClaimReportComponent implements OnInit {

  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  formatAudit: string = 'PDF';
  extensionAudit: string = '';
  reportTitle: string;
  ssrsBaseUrl: string;
  productOptionList: any[];
  productList: any[];
  brokerageList: any[];
  channelList: any[];
  schemeList: any[];

  startDate: Date;
  startMaxDate: Date;
  endMinDate: Date;

  endDate: Date;
  start: any;
  end: any;
  dateError = '';

  form: UntypedFormGroup;
  startDt: UntypedFormControl;
  endDt: UntypedFormControl;
  showReport = false;
  showExport = false;
  exportTypeId = '1';
  isProductTypeFilterVisible = false;
  isProductOptionFilterVisible = false;
  isBrokerageVisible = false;
  isChannelVisible = false;
  isSchemeVisible = false;
  greyOutBrokers = false;
  greyOutChannels = false;
  greyOutSchemes = false;
  isProductFilterVisible = false;
  isExportVisible = false;
  isStartDatePickerVisible = true;
  isEndDatePickerVisible = true;
  isViewReport = true;

  public funeralClaimReportTypes = [
    { name: 'Actuarial Report', value: 'Actuarial' },
    { name: 'Claims Notification Report', value: 'FuneralClaimsNotification' },
    { name: 'Claims Captured Report', value: 'FuneralClaimCaptured' },
    { name: 'Claims Assesment Report', value: 'FuneralClaimsAssesment' },
    { name: 'Claims TAT Report', value: 'ClaimsTAT' },
    { name: 'Claims TAT Repudiation', value: 'ClaimsRepudiationTAT' },
    { name: 'Ex-gratia Funeral Claims Report', value: 'ExGratiaFuneralClaims' },
    { name: 'Funeral Claims Paid', value: 'FuneralClaimsPaid' },
    { name: 'Funeral Claims unPaid', value: 'FuneralClaimsUnPaid' },
    { name: 'Funeral Claims Cancellation Report', value: 'FuneralClaimsCancellation' },
    { name: 'Funeral Claims Repudiation Report', value: 'FuneralClaimsRepudiated' },
    { name: 'Funeral Claims Closed Report', value: 'FuneralClaimsClosed' },
    { name: 'Funeral Claims Waive Report', value: 'FuneralClaimsWaive' },
    { name: 'Funeral Claims Per Policy Report', value: 'FuneralClaimsPerPolicy' },
    { name: 'Funeral Claim Summary Report', value: 'FuneralClaimSummary' },
    { name: 'FSB Report', value: 'FSB' },
    { name: 'Pending Funeral Claims Report', value: 'FuneralClaimsPending' },
    { name: 'Claims vs Life Insured Report', value: 'FuneralClaimsPerEmployeeRate' },
    { name: 'Number Of Claims Captured Report', value: 'NumberClaimsCaptured' },
    { name: 'Number Of Claims Closed Report', value: 'NumberClaimsClosed' },
    { name: 'Number Of Claims Pending For Medical Report', value: 'NumberClaimsPendingMedical' },
    { name: 'Number Of STP Rejected Claims Report', value: 'NumberSTPRejectedClaims' },
    { name: 'Number Of Claims Flagged As Suspicious Report', value: 'NumberClaimsFlaggedSuspicious' },
    { name: 'Number Of Reopened Claims Report', value: 'NumberReopenedClaims' },
  ];
  public selectedReportType: any;
  public selectedProductOption: any;
  public selectedProduct: any;
  public selectedBrokerage: any;
  public selectedChannel: any;
  public selectedScheme: any;

  public productTypes = [
    { name: 'All', value: 0 },
    { name: 'Corporate', value: 1 },
    { name: 'Goldwage', value: 2 },
    { name: 'Group', value: 3 },
    { name: 'Individual', value: 4 }
   
  ];

  public selectedProductType: any;


  constructor(public datePipe: DatePipe,
    private lookupService: LookupService,
    private readonly brokerageService: BrokerageService,
    private readonly productOptionService: ProductOptionService,
    private readonly productService: ProductService,
    private readonly claimCareService: ClaimCareService,
    private formBuilder: UntypedFormBuilder) {
    this.createForm();

    this.startDate = new Date();
    this.startDate.setMonth(this.startDate.getMonth() - 3);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.startDt = new UntypedFormControl(this.startDate);

    this.endDate = new Date();
    this.endDt = new UntypedFormControl(this.endDate);
    const tempEndDate = new Date();
    tempEndDate.setDate(tempEndDate.getDate() + 1);
    this.end = this.datePipe.transform(tempEndDate, 'yyyy-MM-dd');

    this.exportTypeId = '1';
  }

  ngOnInit() {
    const today = new Date();
    this.startMaxDate = today;
    this.endMinDate = this.startDate;

    if (this.selectedReportType === undefined) {
      this.selectedReportType = this.funeralClaimReportTypes.filter(i => i.value === 'FuneralClaimCaptured')[0];
    }
    this.reportTitle = this.selectedReportType.name;

    if (this.selectedProductType === undefined) {

      this.selectedProductType = this.productTypes.filter(i => i.value === 0)[0];
    }

    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      value => {
        this.ssrsBaseUrl = value;
        this.viewDefaultReport();
      }
    );

    this.productOptionService.getProductOptionWithAllOption().subscribe(productOption => {
      this.productOptionList = productOption;
    });

    this.productService.getProductsWithAllOption().subscribe(product => {
      this.productList = product;
    });

  }

  async viewDefaultReport(): Promise<void> {
    this.showReport = false;
    this.showExport = false;
    this.reportTitle = 'Report Manager';
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.Common/Placeholder';
    this.showParametersAudit = 'false';
    this.parametersAudit = { default: true };
    this.languageAudit = 'en-us';
    this.widthAudit = 50;
    this.heightAudit = 50;
    this.toolbarAudit = 'false';
  }

  createForm(): void {
    this.form = new UntypedFormGroup({
      startDt: new UntypedFormControl(''),
      endDt: new UntypedFormControl('', [this.checkEndDate.bind(this)]),
      productOptionValue:new UntypedFormControl(''),
      productValue:new UntypedFormControl('')
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
    this.endMinDate = this.startDate;
  }

  endDateChange(value: Date) {
    this.endDate = new Date(value);
    this.endDate.setDate(this.endDate.getDate() + 1);
    this.end = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
  }

  funeralClaimReportTypeChanged($event: any) {
    this.selectedReportType = this.funeralClaimReportTypes.filter(i => i.value === $event.value.value)[0];
    this.reportTitle = this.selectedReportType.name;
    this.form.controls['productOptionValue'].setValue('');
    this.form.controls['productValue'].setValue('');
    switch (this.selectedReportType.value) {
      case 'FuneralClaimCaptured':
        this.isProductOptionFilterVisible = true;
        this.isBrokerageVisible = true;
        this.isChannelVisible = true;
        this.isSchemeVisible = true;
        this.isProductFilterVisible = false;
        this.isProductTypeFilterVisible = false;
        this.greyOutBrokers = false;
        this.greyOutChannels = false;
        this.greyOutSchemes = false;
        this.brokerageList = [];
        this.channelList = [];
        this.schemeList = [];
        this.isExportVisible = false;
        break;

      case 'ClaimsTAT':
        this.isProductOptionFilterVisible = false;
        this.isBrokerageVisible = false;
        this.isChannelVisible = false;
        this.isSchemeVisible = false;
        this.isProductFilterVisible = false;
        this.isProductTypeFilterVisible = true;
        this.isExportVisible = false;
        this.isStartDatePickerVisible = true;
        this.isEndDatePickerVisible = true;
        break;

      case 'ClaimsRepudiationTAT':
          this.isProductOptionFilterVisible = false;
          this.isBrokerageVisible = false;
          this.isChannelVisible = false;
          this.isSchemeVisible = false;
          this.isProductFilterVisible = false;
          this.isProductTypeFilterVisible = true;
          this.isExportVisible = false;
          this.isStartDatePickerVisible = true;
          this.isEndDatePickerVisible = true;
          break;

      case 'FuneralClaimsClosed':
      case 'FuneralClaimsRepudiated':
      case 'FuneralClaimsCancellation':
      case 'FuneralClaimsPaid':
        this.isProductOptionFilterVisible = false;
        this.isBrokerageVisible = true;
        this.isChannelVisible = false;
        this.isSchemeVisible = true;
        this.isProductFilterVisible = true;
        this.isProductTypeFilterVisible = false;
        this.greyOutBrokers = false;
        this.greyOutChannels = false;
        this.greyOutSchemes = false;
        this.brokerageList = [];
        this.schemeList = [];
        this.isExportVisible = false;
        this.isStartDatePickerVisible = true;
        this.isEndDatePickerVisible = true;
        break;

      case 'FuneralClaimsAssesment':
      case 'FuneralClaimsNotification':
        this.isProductOptionFilterVisible = true;
        this.isBrokerageVisible = true;
        this.isChannelVisible = false;
        this.isSchemeVisible = true;
        this.isProductFilterVisible = false;
        this.isProductTypeFilterVisible = false;
        this.greyOutBrokers = false;
        this.greyOutChannels = false;
        this.greyOutSchemes = false;
        this.brokerageList = [];
        this.channelList = [];
        this.schemeList = [];
        this.isExportVisible = false;
        this.isStartDatePickerVisible = true;
        this.isEndDatePickerVisible = true;
        break;
      case 'FuneralClaimsPerEmployeeRate':
      case 'FuneralClaimSummary':
        this.isProductOptionFilterVisible = false;
        this.isStartDatePickerVisible = false;
        this.isEndDatePickerVisible = false;
        this.isBrokerageVisible = false;
        this.isChannelVisible = false;
        this.isSchemeVisible = false;
        this.isProductFilterVisible = false;
        this.isProductTypeFilterVisible = false;
        this.greyOutBrokers = false;
        this.greyOutChannels = false;
        this.greyOutSchemes = false;
        this.isExportVisible = false;
        this.isViewReport = false;
        break;
        case 'NumberReopenedClaims':
        case 'NumberClaimsFlaggedSuspicious':
        case 'NumberSTPRejectedClaims':
        case 'NumberClaimsPendingMedical':
        case 'NumberClaimsClosed':
        case 'NumberClaimsCaptured':
          this.isStartDatePickerVisible = false;
          this.isEndDatePickerVisible = false;
          this.isViewReport = true;
          this.isExportVisible = true;
        break;
      default:
        this.isProductOptionFilterVisible = false;
        this.isBrokerageVisible = false;
        this.isChannelVisible = false;
        this.isSchemeVisible = false;
        this.isProductTypeFilterVisible = false;
        this.isProductFilterVisible = false;
        this.isExportVisible = true;
        this.isStartDatePickerVisible = true;
        this.isEndDatePickerVisible = true;
    }

    this.showExport = false;


    this.formatAudit = 'PDF';
    this.extensionAudit = '';
  }

  selectedProductTypeChanged($event: any) {
    this.selectedProductType = this.productTypes.filter(i => i.value === $event.value.value)[0];
    this.isExportVisible = true;
  }


  selectedProductOptionChanged($event: any) {
    this.selectedProductOption = $event.value;
    this.brokerageService.getBrokersLinkedtoClaims(this.selectedProductOption).subscribe(brokerages => {
      this.brokerageList = brokerages;
      if (this.brokerageList.length > 0) {
        this.greyOutBrokers = true;
      }
      else {
        this.greyOutBrokers = false;
        this.greyOutChannels = false;
        this.greyOutSchemes = false;
        this.brokerageList = [];
        this.channelList = [];
        this.schemeList = [];
        this.isExportVisible = false;
      }
    });
  }

  selectedBrokerageChanged($event: any) {
    this.selectedBrokerage = $event.value;

    switch (this.selectedReportType.value) {
      case 'FuneralClaimsClosed':
      case 'FuneralClaimsRepudiated':
      case 'FuneralClaimsCancellation':
      case 'FuneralClaimsPaid':
      case 'FuneralClaimsAssesment':
      case 'FuneralClaimsNotification':
        this.claimCareService.getSchemesByBrokeragesLinkedToClaims(this.selectedBrokerage).subscribe(schemes => {
          this.schemeList = schemes;
          if (this.schemeList.length > 0) {
            this.greyOutSchemes = true;
          }
          else {
            this.greyOutSchemes = false;
          }
        });
        break;

      default:
        this.claimCareService.getChannelsForClaims(this.selectedBrokerage).subscribe(channels => {
          this.channelList = channels;
          if (this.channelList.length > 0) {
            this.greyOutChannels = true;
          }
          else {
            this.greyOutChannels = false;
            this.greyOutSchemes = false;
          }
        });
    }
  }

  selectedChannelChanged($event: any) {
    this.selectedChannel = $event.value;
    this.claimCareService.getSchemesForClaims(this.selectedChannel).subscribe(schemes => {
      this.schemeList = schemes;
      if (this.schemeList.length > 0) {
        this.greyOutSchemes = true;
      }
      else {
        this.greyOutSchemes = false;
      }
    });
  }

  selectedSchemeChanged($event: any) {
    this.selectedScheme = $event.value;
    this.isExportVisible = true;
  }

  selectedProductChanged($event: any) {
    this.selectedProduct = $event.value;
    this.claimCareService.getBrokersByProducstLinkedToClaims(this.selectedProduct).subscribe(brokerages => {
      this.brokerageList = brokerages;
      if (this.brokerageList.length > 0) {
        this.greyOutBrokers = true;
      }
      else {
        this.greyOutBrokers = false;
        this.greyOutSchemes = false;
      }
    });
  }


  ExportTypeChanged($event: any) {

    switch ($event.value) {
      case 1: {
        this.formatAudit = 'CSV';
        this.extensionAudit = 'CSV';
        break;
      }
      case 2: {
        this.formatAudit = 'PDF';
        this.extensionAudit = 'PDF';
        break;
      }
      case 3: {
        this.formatAudit = 'EXCEL';
        this.extensionAudit = 'XLS';
        break;
      }
    }
  }

  parameterAudit() {
    switch (this.selectedReportType.value) {
      case 'FuneralClaimCaptured':
        this.parametersAudit = {
          DateFrom: this.start, DateTo: this.end, ProductOption: this.selectedProductOption, Brokerage: this.selectedBrokerage,
          Channel: this.selectedChannel, Scheme: this.selectedScheme
        };
        break;
//ClaimsRepudiationTAT
      case 'ClaimsTAT':
        case 'ClaimsRepudiationTAT':
        this.parametersAudit = { DateFrom: this.start, DateTo: this.end, CoverType: this.selectedProductType.value };
        break;
      case 'FuneralClaimsClosed':
      case 'FuneralClaimsRepudiated':
      case 'FuneralClaimsCancellation':
      case 'FuneralClaimsPaid':
        this.parametersAudit = {
          DateFrom: this.start, DateTo: this.end, Product: this.selectedProduct, Brokerage: this.selectedBrokerage, Scheme: this.selectedScheme
        };
        break;

      case 'FuneralClaimsAssesment':
      case 'FuneralClaimsNotification':
        this.parametersAudit = {
          DateFrom: this.start, DateTo: this.end, ProductOption: this.selectedProductOption, Brokerage: this.selectedBrokerage, Scheme: this.selectedScheme
        };
        break;
      case 'FuneralClaimsPerEmployeeRate':
      case 'FuneralClaimSummary':
        this.parametersAudit = {};
        break;

      default:
        this.parametersAudit = { DateFrom: this.start, DateTo: this.end };
    }

  }

  viewReport() {
    if (this.start < this.end) {
      this.dateError = '';
      this.reportTitle = this.selectedReportType.name;
      this.reportServerAudit = this.ssrsBaseUrl;
      this.reportUrlAudit = 'RMA.Reports.ClaimCare/' + this.selectedReportType.value;
      this.parameterAudit();
      this.showParametersAudit = 'false';
      this.formatAudit = 'PDF';
      this.widthAudit = 100;
      this.heightAudit = 100;
      this.toolbarAudit = 'true';
      this.showReport = true;
      this.showExport = true;
    } else {
      this.dateError = 'From date cannot be greater than To date';
    }
  }

  exportReport() {

    if (this.start < this.end || this.showReport) {
      this.dateError = '';

      this.reportTitle = this.selectedReportType.name;
      this.reportServerAudit = this.ssrsBaseUrl;
      this.reportUrlAudit = 'RMA.Reports.ClaimCare/' + this.selectedReportType.value;
      this.parameterAudit();
      this.showParametersAudit = 'false';
      this.formatAudit = this.formatAudit;
      this.extensionAudit = this.extensionAudit;
      this.languageAudit = 'en-us';
      this.widthAudit = 100;
      this.heightAudit = 100;
      this.toolbarAudit = 'true';
    } else {
      this.dateError = 'From date cannot be greater than To date';
    }
  }
}

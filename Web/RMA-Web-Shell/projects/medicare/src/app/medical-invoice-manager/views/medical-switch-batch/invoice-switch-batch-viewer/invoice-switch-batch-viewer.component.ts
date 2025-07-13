import { Component, OnInit, Inject, Input, SimpleChanges } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MedicalInvoicesList } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-list';
import { MedicalInvoiceLineItem } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-item';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { UntypedFormBuilder } from '@angular/forms';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
import { SwitchBatchType } from 'projects/medicare/src/app/shared/enums/switch-batch-type';
import { TebaInvoiceService } from '../../../services/teba-invoice.service';
import { TebaTariff } from '../../../models/teba-tariff';
import { isNullOrUndefined } from 'util';
import { BehaviorSubject } from 'rxjs';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { TariffSearch } from 'projects/medicare/src/app/preauth-manager/models/tariff-search';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { HealthCareProviderModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/healthare-provider-model';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Utility } from 'projects/medicare/src/app/medi-manager/constants/utility';


@Component({
  selector: 'app-invoice-switch-batch-viewer',
  templateUrl: './invoice-switch-batch-viewer.component.html',
  styleUrls: ['./invoice-switch-batch-viewer.component.css']
})
export class InvoiceSwitchBatchViewerComponent implements OnInit {

  @Input() invoiceData: any;
  @Input() switchBatchType: SwitchBatchType = SwitchBatchType.MedEDI;//default val used if not set/passed
  switchBatchTypeEnum = SwitchBatchType;
  resultTebaTariff: TebaTariff[] = [];
  resultMedicalTariff: TariffSearch[] = [];
  loadingineItems$ = new BehaviorSubject<boolean>(false);
  healthCareProviderModel: HealthCareProviderModel;
  tariffTypeId: number = 0;
  preAuthFromDate: Date;
  practitionerTypeId: number;//providerTypeId
  healthCareProviderId: number;
  isChronicCheck: boolean = false;
  dateAdmitted: Date;
  eventDate: Date;
  practiceNumber: string = "";
  medicalTariffCodesQuery: TariffSearch[] = []

  constructor(
    private currencyPipe: CurrencyPipe,
    private readonly formBuilder: UntypedFormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private tebaInvoiceService: TebaInvoiceService,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private lookupService: LookupService,
    private readonly datePipe: DatePipe,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly icd10CodeService: ICD10CodeService,
    @Inject(MAT_DIALOG_DATA) public invoiceDataClicked: any) {

  }

  currentUrl = this.router.url;

  getDisplayedColumns(): any[] {
    let displayedColumns = [
      { def: "ServiceDate", show: true },
      { def: "hcpTariffCode", show: true },
      { def: "description", show: true },
      { def: "icd10Code", show: this.switchBatchType != SwitchBatchType.Teba },
      { def: "totalTariffAmount", show: true },
      { def: "quantity", show: true },
      { def: "InvUnitAmount", show: true },
      { def: "authorisedAmount", show: true },
      { def: "requestedAmount", show: true },
      { def: "totalTariffVat", show: true },
      { def: "totalIncl", show: true },
    ];

    return displayedColumns.filter((cd) => cd.show).map((cd) => cd.def);
  }

  public invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  public payeeTypeEnum: typeof PayeeTypeEnum = PayeeTypeEnum;

  invoiceLineItems: MedicalInvoiceLineItem[] = [];
  resolvedData: MedicalInvoicesList[];
  concatenatedICD10Codes = '';

  icd10CodesDescriptions: ICD10Code[] = []
  dataSource = new MatTableDataSource<MedicalInvoiceLineItem>(this.invoiceLineItems);

  ngOnInit() {
    this.getDetailsForMedicalInvoices();
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes?.invoiceData?.currentValue?.switchBatchInvoiceLines) {
      this.healthCareProviderId = changes?.invoiceData?.currentValue?.healthCareProviderId
      this.dateAdmitted = changes?.invoiceData?.currentValue?.dateAdmitted;
      this.eventDate = changes?.invoiceData?.currentValue?.eventDate;
      this.isChronicCheck = MedicareUtilities.isChronic(this.eventDate, this.dateAdmitted);
      this.practiceNumber = changes?.invoiceData?.currentValue?.practiceNumber;

      this.invoiceLineItems = changes?.invoiceData?.currentValue?.switchBatchInvoiceLines;

      this.dataSource = new MatTableDataSource<MedicalInvoiceLineItem>(this.invoiceLineItems);
    }

    if (changes?.switchBatchType?.currentValue) {
      this.switchBatchType = changes?.switchBatchType?.currentValue
    }

    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        this.showICD10CodesDescriptions(this.invoiceLineItems)
        let icd10Codes = this.invoiceLineItems.map(lineItem => lineItem.icd10Code);
        icd10Codes = icd10Codes.filter((value, index) => icd10Codes.indexOf(value) === index);
        this.concatenatedICD10Codes = icd10Codes.join("/");
        this.medicalTariffCodesQuery = [];
        
        changes?.invoiceData?.currentValue?.switchBatchInvoiceLines.forEach(element => {
          let medicalLineData: TariffSearch = new TariffSearch()
          medicalLineData.tariffCode = !isNullOrUndefined(element?.tariffCode.toString()) ? element.tariffCode : "";
          medicalLineData.tariffDate = !isNullOrUndefined(element?.serviceDate) ? new Date(element.serviceDate) : new Date();
          medicalLineData.tariffTypeId = this.tariffTypeId;
          this.medicalTariffCodesQuery.push(medicalLineData)
        });
        break;
      case SwitchBatchType.Teba:
        let tariffCodesWithServiceDatesQuery: TebaTariff[] = [];
        changes?.invoiceData?.currentValue?.switchBatchInvoiceLines.forEach(element => {
          let lineData: TebaTariff = new TebaTariff();
          lineData.tariffCode = !isNullOrUndefined(element?.tariffCode.toString()) ? element.tariffCode : "";
          lineData.validFrom = !isNullOrUndefined(element?.serviceDate) ? new Date(element.serviceDate).toDateString() : new Date().toDateString();
          tariffCodesWithServiceDatesQuery.push(lineData)
        });
        this.getLookUpValueByLookupTypeEnum(tariffCodesWithServiceDatesQuery);
        break
      default:
        break;
    }

  }

  getLookUpValueByLookupTypeEnum(teriffQueryData: TebaTariff[]): void {
    this.loadingineItems$.next(true);
    this.tebaInvoiceService.GetTebaTariffs(teriffQueryData).subscribe(
      data => {
        this.resultTebaTariff = [];
        this.resultTebaTariff = data;
        this.loadingineItems$.next(false);
      }
    );
  }

  async getAllLineTariffs() {
    this.loadingineItems$.next(true);
    for (let index = 0; index < this.medicalTariffCodesQuery.length; index++) {
      this.medicalTariffCodesQuery[index].practitionerType = this.healthCareProviderModel.providerTypeId.toString();
      this.medicalTariffCodesQuery[index].practitionerTypeId = this.healthCareProviderModel.providerTypeId;
      this.medicalTariffCodesQuery[index].tariffType = this.tariffTypeId.toString();
      this.medicalTariffCodesQuery[index].tariffTypeId = this.tariffTypeId;
    }

    this.mediCarePreAuthService.getTariffDetails(this.medicalTariffCodesQuery)
      .subscribe(
        (res) => {
          this.resultMedicalTariff = [];
          this.resultMedicalTariff = res
          this.loadingineItems$.next(false);
        });
  }

  async getTebaPracticeNumberKey() {
    const tebaPracticeNumberKey: string = Utility.TEBA_PRACTICE_NUMBER_KEY;
    let tebaKeyVal = await this.lookupService.getItemByKey(tebaPracticeNumberKey).toPromise()
    this.healthCareProviderModel = await this.healthcareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(tebaKeyVal).toPromise();
  }

  async getDetailsForMedicalInvoices() {
    if (this.switchBatchType == SwitchBatchType.MedEDI) {
      this.tariffTypeId = await this.healthcareProviderService.getHealthCareProviderAgreedTariff(this.healthCareProviderId, this.isChronicCheck, this.datePipe.transform(this.dateAdmitted, 'yyyy-MM-dd')).toPromise();
      this.healthCareProviderModel = await this.healthcareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(this.practiceNumber).toPromise();
      this.getAllLineTariffs()
    }
    else {
      await this.getTebaPracticeNumberKey()
    }
  }

  onCloseView() {
    let url: string = "";
    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        url = '/medicare/medical-invoice-list';
        break;
      case SwitchBatchType.Teba:
        url = '/medicare/work-manager/teba-invoice-list';
        break;
      default:
        break;
    }
    this.router.navigate([url]);
  }

  ngOnDestroy() {
    this.activeRoute.snapshot.data
    this.invoiceLineItems = [];
  }

  public calculateTotalQuantity() {
    return this.dataSource.data.reduce((accum, curr) => accum + Number(curr.quantity), 0);
  }

  public calculateTotalTariffAmount() {
    return this.dataSource.data.reduce((accum, curr) => accum + curr.totalTariffAmount, 0);
  }

  public calculateInvTotalAmount() {
    return this.dataSource.data.reduce((accum, curr) => accum + (curr.totalTariffAmount * curr.requestedQuantity), 0);
  }

  public calculateSubTotalExAmount() {
    return this.dataSource.data.reduce((accum, curr) => accum + ((curr.totalInvoiceLineCost * curr.quantity) - curr.creditAmount), 0);
  }

  public calculateTotalTariffVat() {
    return this.dataSource.data.reduce((accum, curr) => accum + (curr.totalInvoiceLineVat * curr.quantity), 0);
  }

  public calculateTotalIncl() {
    return this.dataSource.data.reduce((accum, curr) => accum + ((curr.totalInvoiceLineCostInclusive * curr.quantity) -
      curr.creditAmount + (curr.totalInvoiceLineVat * curr.quantity)), 0);
  }

  tariffInvoiceUnitAmount(teba: TebaTariff, medical: TariffSearch) {
    let value = (this.switchBatchType == SwitchBatchType.Teba) ? teba?.costValue : medical?.tariffAmount;

    return value > 0 ? this.currencyPipe.transform(value, 'R', true, '1.0-2') : 'N/A';
  }

  tariffInvoiceTotalAmount(teba: TebaTariff, medical: TariffSearch, quantity: number) {
    let value = (this.switchBatchType == SwitchBatchType.Teba) ? teba?.costValue : medical?.tariffAmount;
    return value > 0 ? this.currencyPipe.transform(value * quantity, 'R', true, '1.0-2') : 'N/A';
  }

  showICD10CodesDescriptions(invoiceLines: MedicalInvoiceLineItem[]) {
    this.loadingineItems$.next(true);
    let icd10CodesLines: string[] = MedicareUtilities.Icd10CodesListByCommonSeperator(invoiceLines.map(r => r.icd10Code))
    this.icd10CodeService.getICD10CodesDescription(icd10CodesLines).subscribe(icd10CodesListResult => {
      this.loadingineItems$.next(false);
      this.icd10CodesDescriptions = icd10CodesListResult;
    });
  }

}

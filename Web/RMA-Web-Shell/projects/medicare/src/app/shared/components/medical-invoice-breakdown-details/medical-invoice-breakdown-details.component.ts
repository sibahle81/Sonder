import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { isNullOrUndefined } from 'util';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { VatCodeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/vat-code.enum';
import { ValidationStateEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/validation-state-enum';
import { BehaviorSubject } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { InvoiceLineDetails } from '../../../medical-invoice-manager/models/medical-invoice-line-details';
import { MatTableDataSource } from '@angular/material/table';
import { InvoiceDetails } from '../../../medical-invoice-manager/models/medical-invoice-details';
import { ICD10Code } from '../../../medi-manager/models/icd10-code';
import { MedicareUtilities } from '../../medicare-utilities';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ICD10CodeService } from '../../../medi-manager/services/icd10-code-service';
import { RouterModule } from '@angular/router';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { MatMenuModule } from '@angular/material/menu';
import { SwitchBatchType } from '../../enums/switch-batch-type';
import { MedicalInvoiceLineUnderAssessReasonColorPipe } from '../../../medical-invoice-manager/pipes/medical-invoice-line-under-assess-reason-color.pipe';
import { TebaInvoiceLine } from '../../../medical-invoice-manager/models/teba-invoice-line';
import { MedicalInvoiceStatusColorPipe } from '../../../medical-invoice-manager/pipes/medical-invoice-status-color.pipe';
import { MedicalInvoiceTotalsCalculationsPipe } from '../../../medical-invoice-manager/pipes/medical-invoice-totals-calculations.pipe';
import { MedicalInvoiceValidationsPipe } from '../../../medical-invoice-manager/pipes/medical-invoice-validations.pipe';
import { SwitchBatchInvoiceStatusColorPipe } from '../../../medical-invoice-manager/pipes/switch-batch-invoice-status-color.pipe';
import { TebaTariff } from '../../../medical-invoice-manager/models/teba-tariff';
import { TariffSearch } from '../../../preauth-manager/models/tariff-search';
import { TebaInvoiceService } from '../../../medical-invoice-manager/services/teba-invoice.service';
import { MediCarePreAuthService } from '../../../preauth-manager/services/medicare-preauth.service';
import { HealthcareProviderService } from '../../../medi-manager/services/healthcareProvider.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { TebaInvoice } from '../../../medical-invoice-manager/models/teba-invoice';
import { Utility } from '../../../medi-manager/constants/utility';

export enum SelectType {
  single,
  multiple
}

@Component({
  selector: 'app-medical-invoice-breakdown-details',
  templateUrl: './medical-invoice-breakdown-details.component.html',
  standalone: true,
  imports: [MedicalInvoiceLineUnderAssessReasonColorPipe,
    MedicalInvoiceStatusColorPipe,
    MedicalInvoiceTotalsCalculationsPipe,
    MedicalInvoiceValidationsPipe,
    SwitchBatchInvoiceStatusColorPipe, CommonModule, RouterModule, MatMenuModule, SharedComponentsLibModule],
  styleUrls: ['./medical-invoice-breakdown-details.component.css']
})
export class MedicalInvoiceBreakdownDetailsComponent {

  @Input() dataSource = new MatTableDataSource<InvoiceLineDetails | TebaInvoiceLine>;
  @Input() invoiceData: InvoiceDetails[] | TebaInvoice[] = [];
  @Input() isViewMode: boolean = true;
  @Input() showEditOptions: boolean = false;
  @Input() switchBatchType: SwitchBatchType;
  switchBatchTypeEnum = SwitchBatchType


  @Output() deleteLineClicked: EventEmitter<number> = new EventEmitter();
  @Output() editLineClicked: EventEmitter<InvoiceDetails | TebaInvoice> = new EventEmitter();

  loading$ = new BehaviorSubject<boolean>(false);
  loadingClaimsData$ = new BehaviorSubject<boolean>(false);
  loadingLineItems$ = new BehaviorSubject<boolean>(false);
  savingLineItems$ = new BehaviorSubject<boolean>(false);

  medicalInvoiceBreakdownDetailsList: InvoiceLineDetails[] | TebaInvoiceLine[]= [];
  invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  public validationStateEnum: typeof ValidationStateEnum = ValidationStateEnum;

  dataSourceInvoiceBreakdown = new MatTableDataSource<InvoiceLineDetails| TebaInvoiceLine>(this.medicalInvoiceBreakdownDetailsList);
  selection = new SelectionModel<InvoiceLineDetails| TebaInvoiceLine>(true, []);

  icd10CodesDescriptions: ICD10Code[] = [];
  resultTebaTariff: TebaTariff[] = [];
  resultMedicalTariff: TariffSearch[] = [];
  medicalTariffCodesQuery: TariffSearch[] = []
  tariffTypeId: number = 0;
  healthCareProviderId: number = 0;
  isChronicCheck: boolean;
  dateAdmitted: Date;
  healthCareProviderModel: any;
  
  constructor(
    readonly confirmservice: ConfirmationDialogsService,
    private readonly icd10CodeService: ICD10CodeService,
    public readonly rolePlayerService: RolePlayerService,
    private currencyPipe: CurrencyPipe,
    private tebaInvoiceService: TebaInvoiceService,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private lookupService: LookupService,
    private readonly datePipe: DatePipe,
    public dialog: MatDialog) {

  }

  lineItemClickedCheck: InvoiceLineDetails;
  selectedInvoice: InvoiceLineDetails[] | TebaInvoiceLine[] = [];

  getDisplayedColumns(): any[] {
    let displayedColumns = [
      { def: "select", show: this.showEditOptions },
      { def: 'edit', show: this.showEditOptions },
      { def: 'delete', show: this.showEditOptions },
      { def: "ServiceDate", show: true },
      { def: "hcpTariffCode", show: true },
      { def: "description", show: true },
      { def: "icd10Code", show: this.switchBatchType != SwitchBatchType.Teba },
      { def: "totalTariffAmount", show: true },
      { def: "creditAmount", show: true },
      { def: "quantity", show: this.switchBatchType != SwitchBatchType.Teba },
      { def: "InvUnitAmount", show: true },
      { def: "requestedQuantity", show: true },
      { def: "authorisedQuantity", show: true },
      { def: "authorisedAmount", show: true },
      { def: "requestedAmount", show: true },
      { def: "totalTariffVat", show: this.switchBatchType != SwitchBatchType.Teba },
      { def: "totalIncl", show: true },
      { def: "approvedSubAmount", show: true },
      { def: "ApprovedVAT", show: true },
      { def: "ApprovedTotalAmountIncl", show: true },
      { def: "Validation", show: true },
    ];

    return displayedColumns.filter((cd) => cd.show).map((cd) => cd.def);
  }

  selectType = [
    { text: "Single", value: SelectType.single },
    { text: "Multiple", value: SelectType.multiple }
  ];

  displayType = SelectType.single;

  selectHandler(row: InvoiceLineDetails |TebaInvoiceLine) {
    if (this.displayType == SelectType.single) {
      if (!this.selection.isSelected(row)) {
        this.selection.clear();
      }
    }
    this.selection.toggle(row);
    this.dataSourceInvoiceBreakdown = new MatTableDataSource<InvoiceLineDetails| TebaInvoiceLine>((this.selection.selected.length == 0) ? [] : this.selection.selected);
    this.selectedInvoice = this.selection.selected as any;
  }

  onEditLineItem(element) {
    this.editLineClicked.emit(element);
  }

  onDeleteLineItem(element) {
    let elementInvoiceLineId: number = (this.switchBatchType == SwitchBatchType.MedEDI) ? element?.invoiceLineId : element?.tebaInvoiceLineId;
    this.deleteLineClicked.emit(elementInvoiceLineId);
  }

  ngOnInit() {
    
  }


  ngOnChanges(changes: SimpleChanges) {
    
    if (changes?.dataSource?.currentValue?.data && changes?.dataSource?.currentValue?.data.length > 0)
      this.dataSource.data = changes?.dataSource?.currentValue?.data;

    if (changes?.switchBatchType?.currentValue)
      this.switchBatchType = changes?.switchBatchType?.currentValue

    if (!isNullOrUndefined(changes?.invoiceData?.currentValue)) {
      
      this.invoiceData = changes?.invoiceData?.currentValue.length > 0 ? changes?.invoiceData?.currentValue[0] : changes?.invoiceData?.currentValue;
      this.healthCareProviderId = this.invoiceData['healthCareProviderId'];
      let dateFrom = this.invoiceData['dateAdmitted'];
      let dateTo = this.invoiceData['dateDischarged'];
      this.isChronicCheck = MedicareUtilities.isChronic(dateFrom, dateTo);
      this.dateAdmitted = this.switchBatchType == SwitchBatchType.MedEDI && !isNullOrUndefined(dateFrom) ? dateFrom : new Date();
    }

    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        this.getDisplayedColumns()
        // Filter out only InvoiceLineDetails
        const filteredInvoices: InvoiceLineDetails[] = this.dataSource?.data.filter((invoice): invoice is InvoiceLineDetails => {
          return !isNullOrUndefined((invoice as InvoiceLineDetails).serviceDate)// !== undefined; // Adjust condition based on your properties
        });

        if (!isNullOrUndefined(this.dataSource) && this.dataSource?.data?.length > 0) {
          this.showICD10CodesDescriptions(filteredInvoices);
        }
        this.medicalTariffCodesQuery = [];
        changes?.dataSource?.currentValue?.data.forEach(element => {
          let medicalLineData: TariffSearch = new TariffSearch()
          medicalLineData.tariffCode = !isNullOrUndefined(element?.hcpTariffCode.toString()) ? element.hcpTariffCode : "";
          medicalLineData.tariffDate = !isNullOrUndefined(element?.serviceDate) ? new Date(element.serviceDate) : new Date();
          medicalLineData.tariffTypeId = this.tariffTypeId;
          this.medicalTariffCodesQuery.push(medicalLineData)
        });

        break;
      case SwitchBatchType.Teba:
        this.getDisplayedColumns()

        let tariffCodesWithServiceDatesQuery: TebaTariff[] = [];
        changes?.dataSource?.currentValue?.data.forEach(element => {
          let lineData: TebaTariff = new TebaTariff();
          lineData.tariffCode = !isNullOrUndefined(element?.hcpTariffCode.toString()) ? element.hcpTariffCode : "";
          lineData.validFrom = !isNullOrUndefined(element?.serviceDate) ? new Date(element.serviceDate).toDateString() : new Date().toDateString();
          tariffCodesWithServiceDatesQuery.push(lineData)
        });

        if (this.dataSource.data.length > 0 && !isNullOrUndefined(this.invoiceData))
          this.getLookUpValueByLookupTypeEnum(tariffCodesWithServiceDatesQuery);

        break;

      default:
        break;
    }
    if (this.dataSource.data.length > 0 && !isNullOrUndefined(this.invoiceData) && this.switchBatchType)
      this.getDetailsForMedicalInvoices();

  }

  async getDetailsForMedicalInvoices() {
    if (this.switchBatchType == SwitchBatchType.MedEDI) {
      this.tariffTypeId = await this.healthcareProviderService.getHealthCareProviderAgreedTariff(this.healthCareProviderId, this.isChronicCheck, this.datePipe.transform(this.dateAdmitted, 'yyyy-MM-dd')).toPromise();
      this.healthCareProviderModel = await this.healthcareProviderService.getHealthCareProviderById(this.healthCareProviderId).toPromise();
      this.getAllLineTariffs()
    }
    else {
      await this.getTebaPracticeNumberKey();
    }
  }

  async getAllLineTariffs() {
    this.loadingLineItems$.next(true);

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
          this.loadingLineItems$.next(false);
        });
  }

  async getTebaPracticeNumberKey() {
    const tebaPracticeNumberKey: string = Utility.TEBA_PRACTICE_NUMBER_KEY;
    let tebaKeyVal = await this.lookupService.getItemByKey(tebaPracticeNumberKey).toPromise()
    this.healthCareProviderModel = await this.healthcareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(tebaKeyVal).toPromise();
  }

  getLookUpValueByLookupTypeEnum(teriffQueryData: TebaTariff[]): void {
    this.loadingLineItems$.next(true);
    this.tebaInvoiceService.GetTebaTariffs(teriffQueryData).subscribe(
      data => {
        this.resultTebaTariff = [];
        this.resultTebaTariff = data;
        this.loadingLineItems$.next(false);
      }
    );
  }

  showICD10CodesDescriptions(invoiceLines: InvoiceLineDetails[]) {
    this.loadingLineItems$.next(true);
    let icd10CodesLines: string[] = MedicareUtilities.Icd10CodesListByCommonSeperator(invoiceLines.map(r => r.icd10Code))
    this.icd10CodeService.getICD10CodesDescription(icd10CodesLines).subscribe(icd10CodesListResult => {
      this.icd10CodesDescriptions = icd10CodesListResult;
      this.loadingLineItems$.next(false);
    });
  }

  getSubTotalEx(): number {
    let subTotalEx: number = 0;
    if (!isNullOrUndefined(this.dataSource) && this.dataSource?.data?.length > 0) {
      this.dataSource.data.forEach(a => subTotalEx += (a.requestedAmount));
    }
    return subTotalEx;
  }

  captureGetTotalVAT(): number {
    let vatTotal: number = 0;
    if (!isNullOrUndefined(this.dataSource) && this.dataSource?.data?.length > 0) {
      vatTotal = this.dataSource.data.map(t => t.requestedVat).reduce((acc, value) => acc + value, 0);
    }
    return vatTotal;
  }
 
  captureGetTotalIncl(): number {
    let captureGetTotalIncl: number = 0;
    if (!isNullOrUndefined(this.dataSource) && this.dataSource?.data?.length > 0) {
      captureGetTotalIncl = this.dataSource.data.map(t => (t.requestedAmount + t.requestedVat)).reduce((acc, value) => acc + value, 0);
    }
    return captureGetTotalIncl;
  }

  healthCareProviderVatAmount(item) {
    if (!isNullOrUndefined(this.dataSource) && this.dataSource?.data?.length > 0)
      return (item[0].vatCode == VatCodeEnum.StandardVATRate) ? (item[0].totalTariffVat / item[0].totalTariffAmount) * 100 : 0;

    return 0;
  }

  getTotalAuthorisedAmountInc() {
    let totalAuthorisedAmountIncl: number = 0;
    if (!isNullOrUndefined(this.dataSource) && this.dataSource?.data?.length > 0) {
      this.dataSource.data.forEach(a => totalAuthorisedAmountIncl += a.authorisedAmountInclusive);
    }
    return totalAuthorisedAmountIncl;
  }

  getTotalAuthorisedAmount() {
    let totalAuthorisedAmount: number = 0;
    if (!isNullOrUndefined(this.dataSource) && this.dataSource?.data?.length > 0) {
      this.dataSource.data.forEach(a => totalAuthorisedAmount += a.authorisedAmount);
    }
    return totalAuthorisedAmount;
  }

  getTotalAuthorisedVat() {
    let totalAuthorisedVat: number = 0;
    if (!isNullOrUndefined(this.dataSource) && this.dataSource?.data?.length > 0) {
      this.dataSource.data.forEach(a => totalAuthorisedVat += a.authorisedVat);
    }
    return totalAuthorisedVat;
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string): string {
    //format enum values for HTML display purposes example: ChronicMedication to Chronic Medication
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

}

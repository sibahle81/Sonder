import { Component, OnInit, Inject, Optional } from '@angular/core';
import { DatePipe } from '@angular/common'
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MedicalInvoicesList } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-list';
import { MedicalInvoiceLineItem } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-item';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { Router } from '@angular/router';
import { MedicalReportQueryParams } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-report-query-params';
import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
import { MedicalInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice.service';
import { WorkItemTypeEnum } from 'projects/digicare/src/app/work-manager/models/enum/work-item-type.enum';
import { InvoiceReportMapDetail } from 'projects/medicare/src/app/medical-invoice-manager/models/invoice-medical-report-map-details';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { ValidationStateEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/validation-state-enum';
import { isNullOrUndefined } from 'util';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { BehaviorSubject } from 'rxjs';
import { MedicareMedicalInvoiceCommonService } from '../../services/medicare-medical-invoice-common.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { SwitchBatchType } from '../../../shared/enums/switch-batch-type';
import { MedicareTravelauthService } from '../../../preauth-manager/services/medicare-travelauth.service';
import { MedicareUtilities } from '../../../shared/medicare-utilities';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';

@Component({
  selector: 'app-view-medical-invoice',
  templateUrl: './view-medical-invoice.component.html',
  styleUrls: ['./view-medical-invoice.component.css']
})

export class ViewMedicalInvoiceComponent implements OnInit {


  constructor(
    private activeRoute: ActivatedRoute,
    public datepipe: DatePipe,
    private readonly medicalFormService: MedicalFormService,
    private medicalInvoiceService: MedicalInvoiceService,
    private readonly medicareTravelAuthService: MedicareTravelauthService,
    private medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    private readonly eventService: ClaimCareService,
    private router: Router,
    public readonly rolePlayerService: RolePlayerService,
    @Optional() @Inject(MAT_DIALOG_DATA) public duplicateInvoiceDetails: any) {
      if (!isNullOrUndefined(duplicateInvoiceDetails)) {
        this.invoiceData = duplicateInvoiceDetails.duplicateInvoiceDetails;
        this.isDialog = true;
      }
  }

  currentUrl = this.router.url;

  displayedColumns: string[] = [
    "ServiceDate",
    "ServiceTimeStart",
    "ServiceTimeEnd",
    "hcpTariffCode",
    "description",
    "icd10Code",
    "totalTariffAmount",
    "quantity",
    "InvUnitAmount",
    "requestedQuantity",
    "authorisedQuantity",
    "authorisedAmount",
    "requestedAmount",
    "totalTariffVat",
    "creditAmount",
    "totalIncl",
    "approvedSubAmount",
    "ApprovedVAT",
    "ApprovedTotalAmountIncl",
    'Validation'
  ];

  public invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  public payeeTypeEnum: typeof PayeeTypeEnum = PayeeTypeEnum;
  payeeName:string = "";
  public validationStateEnum: typeof ValidationStateEnum = ValidationStateEnum;

  invoiceLineItems: MedicalInvoiceLineItem[] = [];
  resolvedData: MedicalInvoicesList[];
  medicalReportList: MedicalReportForm[] = [];
  medicalReportType = WorkItemTypeEnum;
  invoiceData;
  canViewImages;
  healthCareProviderVatAmount: number;
  linkPreAuthDetailsList: PreAuthorisation[] = [];
  loading$ = new BehaviorSubject<boolean>(false);
  loadingClaimsData$ = new BehaviorSubject<boolean>(false);

  dataSource = new MatTableDataSource<MedicalInvoiceLineItem>(this.invoiceLineItems);
  selectedEvent: EventModel;
  personEventId: number;
  isDialog: boolean = false;
  moduleType: ModuleTypeEnum[] = [ModuleTypeEnum.MediCare];
  rolePlayerDetails: RolePlayer;
  switchBatchType: SwitchBatchType;
  switchBatchTypeEnum = SwitchBatchType;

  documentSystemName = DocumentSystemNameEnum.MediCareManager;
  documentSet = DocumentSetEnum.MedicareMedicalInvoice;
  documentTypeEnums = [DocumentTypeEnum.MedicareMedicalInvoice];
  linkedId: number;
  key: string = 'MedicareMedicalInvoice';
  requiredDocumentsUploaded = false;
  documentsEmitted: GenericDocument[];

  ngOnInit() {

    this.activeRoute.params.subscribe(params => {
      if (params.switchBatchType) {
        this.switchBatchType = +params.switchBatchType;
      }
    });

    if (!isNullOrUndefined(this.activeRoute.snapshot.data['medicalInvoiceDetails'])) {
      this.resolvedData = this.activeRoute.snapshot.data['medicalInvoiceDetails'];
      this.invoiceData = this.resolvedData;
      this.invoiceLineItems = this.resolvedData['invoiceLineDetails'];
      this.healthCareProviderVatAmount = (this.invoiceData.isVat) ?
        parseFloat(((this.invoiceLineItems[0]?.totalTariffVat / this.invoiceLineItems[0]?.totalTariffAmount) * 100).toFixed(2)) : 0;
    }
    else if (this.invoiceData) {
      this.invoiceLineItems = this.invoiceData.invoiceLineDetails;
      this.healthCareProviderVatAmount = (this.invoiceData.isVat) ?
        parseFloat(((this.invoiceLineItems[0]?.totalTariffVat / this.invoiceLineItems[0]?.totalTariffAmount) * 100).toFixed(2)) : 0;
    }

    this.dataSource = new MatTableDataSource<MedicalInvoiceLineItem>(this.invoiceLineItems);
    this.personEventId = !isNullOrUndefined(this.invoiceData?.personEventId) ? this.invoiceData?.personEventId : 0;
    this.getEvent(this.personEventId);
    this.checkActionsPermissions();
    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        this.getMedicalReportDetails();
        this.getLinkedPreAuthDetails();
        break;
      case SwitchBatchType.Teba:
        if(!isNullOrUndefined(this.invoiceData.preAuthId) && this.invoiceData.preAuthId > 0)
          this.getLinkedTravelAuthDetails()
        break;
      default:
        break;
    }

  }

  getMedicalReportDetails() {
    this.loading$.next(true);
    this.medicareMedicalInvoiceCommonService.getMappedInvoiceMedicalReports(this.invoiceData.invoiceId).subscribe(res => {
      this.medicalReportList = res;
      this.loading$.next(false);
    });
  }

  getLinkedPreAuthDetails() {
    this.loading$.next(true);
    this.medicareMedicalInvoiceCommonService.getMappedInvoicePreAuthDetails(this.invoiceData.invoiceId).subscribe(res => {
      this.loading$.next(false);
      this.linkPreAuthDetailsList = res;
    });
  }

  getLinkedTravelAuthDetails() {
    this.loading$.next(true);
    this.medicareTravelAuthService.getTravelAuthorisation(this.invoiceData.preAuthId).subscribe(data => {
      this.loading$.next(false);
      this.linkPreAuthDetailsList.push(MedicareUtilities.convertTravelAuthorisationToPreAuthorisation(data));
    });
  }

  onNavigateBack() {
    let url: string = "";
    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        url = isNullOrUndefined(sessionStorage.getItem("previousMedicalInvoiceSearchLink")) ? '/medicare/medical-invoice-list' : sessionStorage.getItem("previousMedicalInvoiceSearchLink");
        break;
      case SwitchBatchType.Teba:
        url = '/medicare/work-manager/teba-invoice-list';
        break;
      default:
        break;
    }

    this.router.navigate([url]);
  }

  checkActionsPermissions(): void {
    this.canViewImages = false;//will be conditional based on some rules
  }

  getVatFromTotal(total: number,quantity: number) {
    let vatOnly = total * this.healthCareProviderVatAmount / 100;
    let totalVatAmount = vatOnly * quantity;
    return totalVatAmount;
}

getInvoicePaidDays(dateSubmitted: Date, paymentConfirmationDate: Date){
  if(dateSubmitted == null || paymentConfirmationDate == null)
    return "";
  let paidDays = this.getDays(dateSubmitted, paymentConfirmationDate);
  return paidDays;
}

getInvoicePaidDaysColor(dateSubmitted: Date, paymentConfirmationDate: Date){
  if(dateSubmitted == null || paymentConfirmationDate == null)
    return "transparent";
  let paidDays = this.getDays(dateSubmitted, paymentConfirmationDate);
  if(paidDays <= 0)
    return "darkgreen";
  else if (paidDays >= 1 && paidDays <= 2)
    return "lightgreen";
  else if (paidDays >= 3 && paidDays <= 5)
    return "yellow";
  else if (paidDays >= 6 && paidDays <= 10)
    return "orange";
  else if (paidDays >= 11 && paidDays <= 30)
    return "red";
  else if (paidDays > 30)
    return "darkred";
  }

 getDays(dateSubmitted: Date, paymentConfirmationDate: Date): number {  
    dateSubmitted = new Date(dateSubmitted);
    paymentConfirmationDate = new Date(paymentConfirmationDate);
    let days = Math.floor((paymentConfirmationDate.getTime() - dateSubmitted.getTime()) / 1000 / 60 / 60 / 24);
    return days;
  }
  
  getEvent(PersonEventIdParam) {
    if (PersonEventIdParam > 0) {
      this.loadingClaimsData$.next(true);
      this.eventService.getPersonEventDetails(PersonEventIdParam).subscribe(result => {
        this.selectedEvent = result;
        this.personEventId = result?.personEvents[0]?.personEventId;
        this.loadingClaimsData$.next(false);
        this.getPayeeDetails()
      })
    }
  }

  getPayeeDetails() {
    this.loading$.next(true);
    let selectedPayeeTypeId = this.invoiceData.payeeTypeId

    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        //awaiting Medicare business to confirm wether Payee or RolePlayer types to be used
        const rolePlayerId = (PayeeTypeEnum.Individual == selectedPayeeTypeId) ? this.selectedEvent?.personEvents[0]?.insuredLifeId
          : (PayeeTypeEnum.Employer == selectedPayeeTypeId) ? this.selectedEvent?.personEvents[0]?.companyRolePlayerId
            : (PayeeTypeEnum.HealthCareProvider == selectedPayeeTypeId) ? this.invoiceData?.healthCareProviderId : 0;

        if (rolePlayerId > 0) {
          this.rolePlayerService.getRolePlayer(rolePlayerId).subscribe(result => {
            this.rolePlayerDetails = result
            this.payeeName = this.rolePlayerDetails.displayName.length > 0 ? this.rolePlayerDetails.displayName : "N/A";
            this.loading$.next(false);
          });
        }
        else {
          this.loading$.next(false);
          this.payeeName = "N/A";
        }
        break;
      case SwitchBatchType.Teba:
        this.payeeName = PayeeTypeEnum[PayeeTypeEnum.Teba];
        this.loading$.next(false);
        break;
      default:
        break;
    }
  }

  ngOnDestroy() {
    this.activeRoute.snapshot.data
    this.invoiceLineItems = [];
  }

}

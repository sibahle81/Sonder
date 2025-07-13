import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common'
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MedicalInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice.service';
import { MedicalInvoicesList } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-list';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { Router } from '@angular/router';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { ValidationStateEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/validation-state-enum';
import { isNullOrUndefined } from 'util';
import { PaymentAllocationDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/payment-allocation-details';
import { PaymentDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/payment-details';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { AllocationPaymentModel } from 'projects/fincare/src/app/shared/models/allocation-payment.model';
import { PaymentAllocationStatusEnum } from 'projects/fincare/src/app/shared/enum/payment-allocation-status-enum';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { PaymentStatusEnum } from 'projects/fincare/src/app/shared/enum/payment-status-enum';
import { RemittanceReportDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/remittance-report-dialog/remittance-report-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { SwitchBatchType } from '../../../shared/enums/switch-batch-type';
@Component({
  selector: 'app-view-payment-breakdown',
  templateUrl: './view-payment-breakdown.component.html',
  styleUrls: ['./view-payment-breakdown.component.css']
})

export class ViewPaymentBreakdownComponent implements OnInit {

  allocationPaymentData$: Observable<AllocationPaymentModel>;

  constructor(
    private activeRoute: ActivatedRoute,
    public datepipe: DatePipe,
    private router: Router,
    private medicalInvoiceService: MedicalInvoiceService,
    public dialog: MatDialog,
    private readonly paymentService: PaymentService) {
  }

  displayedPaymentColumns: string[] = [
    "paymentId",
    "paymentStatus",
    "isReversal",
    "payee",
    "amount",
    "datePaid",
    "dateAuthorised",
    "paymentStatusReason"
  ];

  currentUrl = this.router.url;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  public payeeTypeEnum: typeof PayeeTypeEnum = PayeeTypeEnum;
  public PaymentAllocationStatusEnum: typeof PaymentAllocationStatusEnum = PaymentAllocationStatusEnum;
  public PaymentTypeEnum: typeof PaymentTypeEnum = PaymentTypeEnum;
  public PaymentStatusEnum: typeof PaymentStatusEnum = PaymentStatusEnum;
  public validationStateEnum: typeof ValidationStateEnum = ValidationStateEnum;
  resolvedData: MedicalInvoicesList[] = [];
  invoiceData: any;
  invoiceAllocationData = new PaymentAllocationDetails();
  paymentDetails: PaymentDetails[] = [];
  dataSourcePayment = new MatTableDataSource<PaymentDetails>(this.paymentDetails);
  switchBatchType: SwitchBatchType;
  paymentTypeEnum: PaymentTypeEnum;

  ngOnInit() {

    this.activeRoute.params.subscribe(params => {
      if (params.switchBatchType) {
        this.switchBatchType = +params.switchBatchType;
        this.paymentTypeEnum = (this.switchBatchType == SwitchBatchType.MedEDI) ? PaymentTypeEnum.MedicalInvoice : PaymentTypeEnum.TebaInvoice;
      }
    });

    if (!isNullOrUndefined(this.activeRoute.snapshot.data['medicalInvoiceDetails'])) {

      this.resolvedData = this.activeRoute.snapshot.data['medicalInvoiceDetails'];
      this.invoiceData = this.resolvedData;
      this.getAllocationsByMedicalInvoiceId(this.invoiceData.invoiceId, this.paymentTypeEnum);
    }

    this.allocationPaymentData$.subscribe({
      next: value => { },
      complete: () => { this.isLoading$.next(false) }
    });
  }

  getAllocationsByMedicalInvoiceId(invoiceId: number, paymentTypeEnum: PaymentTypeEnum) {
    this.allocationPaymentData$ = this.paymentService.GetAllocationsByMedicalInvoiceId(invoiceId, paymentTypeEnum);
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

  openRemittanceViewDialog(paymentModel: AllocationPaymentModel) {
    const dialogRef = this.dialog.open(RemittanceReportDialogComponent, {
      width: '80%',
      disableClose: true,
      data: {
        title: `Medical Invoice Remittance Report`,
        report: { key: 'HCP Remittance', value: 'RMA.Reports.FinCare/Remittance/RMARemittanceHCPV2Report' },
        parameters: [
          { key: 'RolePlayerId', value: paymentModel.payeeId.toString() },
          { key: 'PaymentId', value: paymentModel.payment.paymentId.toString() }
        ]
      }
    });
  }

  ngOnDestroy() {
    this.activeRoute.snapshot.data
    this.resolvedData = [];
  }

  isLoading(val: boolean) {
    let checkLoad = val ? false : true;
    this.isLoading$.next(val);
    return checkLoad;
  }

  enableRemitanceView(status: number) {
    return (status === PaymentStatusEnum.Reconciled || status === PaymentStatusEnum.Reversed)
  }

}
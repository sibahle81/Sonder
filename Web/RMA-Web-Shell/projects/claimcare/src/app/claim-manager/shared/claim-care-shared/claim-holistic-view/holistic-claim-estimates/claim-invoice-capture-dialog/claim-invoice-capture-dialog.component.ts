import { Component, Inject } from '@angular/core';
import { ClaimEstimate } from '../../../../entities/personEvent/claimEstimate';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ClaimInvoice } from '../../../../entities/claim-invoice.model';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { ClaimInvoiceService } from 'projects/claimcare/src/app/claim-manager/services/claim-invoice.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { Claim } from '../../../../entities/funeral/claim.model';
import { BeneficiaryBankAccountDialogComponent } from '../../../claim-invoice-container/claim-paged-invoices/beneficiary-bank-account-dialog/beneficiary-bank-account-dialog.component';
import { ClaimBenefit } from '../../../../entities/claim-benefit';

@Component({
  selector: 'claim-invoice-capture-dialog',
  templateUrl: './claim-invoice-capture-dialog.component.html',
  styleUrls: ['./claim-invoice-capture-dialog.component.css']
})
export class ClaimInvoiceCaptureDialogComponent {

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  claimEstimate: ClaimEstimate;
  personEvent: PersonEventModel;
  claim: Claim;
  isReadOnly = false;

  selectedPayeeRolePlayers: RolePlayer[];
  selectedBankAccount: RolePlayerBankingDetail;

  claimInvoices: ClaimInvoice[];

  claimBenefit: ClaimBenefit;

  constructor(
    private readonly claimInvoiceService: ClaimInvoiceService,
    private readonly alert: ToastrManager,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ClaimInvoiceCaptureDialogComponent>
  ) {
    this.claimEstimate = this.data.claimEstimate;
    this.personEvent = this.data.personEvent;
    this.claim = this.data.claim;
    this.isReadOnly = this.data.isReadOnly;

    this.getClaimBenefit();
  }

  getClaimBenefit() {
    this.claimInvoiceService.getClaimBenefitsByClaimId(this.claim.claimId).subscribe(result => {
      this.claimBenefit = result.find(s => s.benefitId == this.claimEstimate.benefitId);
      this.isLoading$.next(false);
    });
  }

  getInvoiceTypeByEstimateTypeMapping(): ClaimInvoiceTypeEnum {
    switch (this.claimEstimate.estimateType) {
      case EstimateTypeEnum.Sectn56:
        return ClaimInvoiceTypeEnum.OtherBenefitAwd;

      default:
        return ClaimInvoiceTypeEnum.OtherBenefitAwd;
    }
  }

  save() {
    this.isLoading$.next(true);
    this.claimInvoiceService.createClaimInvoices(this.claimInvoices).subscribe(results => {
      this.alert.successToastr('Claim Invoices Created Successfully...');
      this.close(true);
    });
  }

  close(triggerRefresh: boolean) {
    this.dialogRef.close(triggerRefresh);
  }

  setSelectedPayees($event: RolePlayer[]) {
    this.selectedPayeeRolePlayers = $event;
    this.generateClaimInvoices();
  }

  generateClaimInvoices() {
    this.claimInvoices = [];
    const availableValue = this.claimEstimate.estimatedValue - this.claimEstimate.allocatedValue;

    if (availableValue > 0) {
      this.selectedPayeeRolePlayers.forEach(payeeRolePlayer => {
        const claimInvoice = new ClaimInvoice();
        claimInvoice.claimId = this.claimEstimate.claimId;
        claimInvoice.claimInvoiceType = this.getInvoiceTypeByEstimateTypeMapping();
        claimInvoice.payeeRolePlayerId = payeeRolePlayer.rolePlayerId;
        claimInvoice.claimBenefitId = this.claimBenefit.claimBenefitId;
        claimInvoice.dateReceived = new Date().getCorrectUCTDate();
        claimInvoice.dateSubmitted = new Date().getCorrectUCTDate();
        claimInvoice.invoiceAmount = this.getInvoiceAmount();
        claimInvoice.authorisedAmount = claimInvoice.invoiceAmount;
        claimInvoice.invoiceDate = new Date().getCorrectUCTDate();
        claimInvoice.claimInvoiceStatusId = ClaimInvoiceStatusEnum.Captured;
        claimInvoice.internalReferenceNumber = this.claim.claimReferenceNumber;
        claimInvoice.externalReferenceNumber = this.claim.claimReferenceNumber;
        claimInvoice.payee = payeeRolePlayer.displayName;
        claimInvoice.claimEstimateId = this.claimEstimate.claimEstimateId;

        this.claimInvoices.push(claimInvoice);
      });
    }
  }

  getInvoiceAmount(): number {
    const totalAvailableAmount = (this.claimEstimate.estimatedValue - this.claimEstimate.allocatedValue);
    switch (this.claimEstimate.estimateType) {
      // case EstimateTypeEnum.SET_YOUR_TYPE_HERE:
      //   return // handle the breakdown per estimate type here automatically
      //   break;

      default: return this.selectedPayeeRolePlayers.length > 0 ? totalAvailableAmount / this.selectedPayeeRolePlayers.length : totalAvailableAmount;
    }
  }

  openBeneficiaryBankAccountDialog($event: ClaimInvoice) {
    const beneficiary = this.selectedPayeeRolePlayers.find(s => s.rolePlayerId == $event.payeeRolePlayerId);

    const dialogRef = this.dialog.open(BeneficiaryBankAccountDialogComponent, {
      width: '60%',
      maxHeight: '700px',
      disableClose: true,
      data: {
        selectedBeneficiary: beneficiary
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        $event.payeeRolePlayerBankAccountId = result.payeeRolePlayerBankingDetail.rolePlayerBankingId;
      }
    });
  }

  resetBeneficiaryBankAccount($event: ClaimInvoice) {
    $event.payeeRolePlayerBankAccountId = null;
  }

  getOutstandingAmount(): string {
    const value = this.claimEstimate.estimatedValue - this.claimEstimate.allocatedValue;
    return value > 0 ? this.formatMoney(value.toString()) : '0.00';
  }

  calculateOutstandingAmount(): number {
    const value = this.claimEstimate.estimatedValue - this.claimEstimate.allocatedValue;
    return value > 0 ? value : 0;
  }

  getSplit(claimInvoice: ClaimInvoice): string {
    return ((claimInvoice.invoiceAmount / this.claimEstimate.estimatedValue) * 100)?.toFixed(2);
  }

  getInvoiceType(claimInvoiceType: ClaimInvoiceTypeEnum): string {
    return this.formatText(ClaimInvoiceTypeEnum[claimInvoiceType]);
  }

  getEstimateType(id: number) {
    return this.formatText(EstimateTypeEnum[id]);
  }

  formatAmount(value: number): string {
    return value > 0 ? this.formatMoney(value.toString()) : '0.00';
  }

  formatMoney(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num) || num === 0) { return '0.00'; }
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : '-';
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BeneficiaryBankDetail } from 'projects/shared-components-lib/src/lib/beneficiary-banking-detail/beneficiary-bank-detail.model';
import { ClaimPaymentModel } from '../../../shared/entities/funeral/claim-payment.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { DecisionEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/decision-enum';
import { ClaimInvoice } from '../../../shared/entities/claim-invoice.model';
import { InvoiceAllocation } from '../../../shared/entities/invoice-allocation.model';
import { PaymentMethodEnum } from 'projects/shared-models-lib/src/lib/enums/payment-method-enum';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';

@Component({
  selector: 'app-claim-recovery',
  templateUrl: './claim-recovery.component.html',
  styleUrls: ['./claim-recovery.component.css'],
  providers:[DecimalPipe]
})

export class ClaimRecoveryComponent extends DetailsComponent implements OnInit {

  decisionFormGroup: UntypedFormGroup;
  bankingDetailsFormGroup: UntypedFormGroup;
  paymentDetailsFormGroup: UntypedFormGroup;
  beneficiaryDetailsFormGroup: UntypedFormGroup;

  bankId: number;
  claimId: number; // = 261;
  beneficiaryId = 0;
  checkDecisionId: number;

  messages: any;
  errorMessages: any[];

  isLoading: boolean;
  isProcessing: boolean;
  disableReason: boolean;
  isMessageText: boolean;
  disableAmounts: boolean;
  disableNoteText: boolean;
  disableTracingFee: boolean;
  showDecisionReason: boolean;
  disableAllocPercent: boolean;
  isAdminApproveDecline: boolean;
  disableBeneficiaryCoverAmount: boolean;
  disableUnclaimedInterestAmount: boolean;

  currentUser: User;
  currentUserEmail: string;
  claimInvoice: ClaimInvoice;
  notesRequest: NotesRequest;
  decisionEnum = DecisionEnum;

  claimPaymentDetail: ClaimPaymentModel;
  paymentMethodEnum = PaymentMethodEnum;
  claimPaymentDetails: ClaimPaymentModel[];
  claimInvoiceTypeEnum = ClaimInvoiceTypeEnum;
  reasons = [
      {id:1, reason: 'Suspicious Claim'},
      {id:2, reason: 'Overaged Child'},
      {id:3, reason: 'False information at application stage'},
      {id:4, reason: 'Still born under 26 weeks'},
      {id:5, reason: 'Life assured died within the waiting period'},
      {id:6, reason: 'Suicide within the first 12months from DOC or increase cover date'},
      {id:7, reason: 'Late notification (after 3 months of date of death)'},
  ];

  constructor(
    dateAdapter: DateAdapter<NativeDateAdapter>,
    private readonly router: Router,
    private readonly datePipe: DatePipe,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly notesService: NotesService,
    private readonly alertService: AlertService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly appEventsManager: AppEventsManager,
    private readonly claimCareService: ClaimCareService,
    private decimalPipe: DecimalPipe) {
    super(appEventsManager, alertService, router, '', '', 1);
    dateAdapter.setLocale('en-za');
  }

  showBankAccount: boolean;
  beneficiaryBankingDetails: BeneficiaryBankDetail[];
  selectedClaimDecision: any;

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.claimId = params.id;
      this.beneficiaryId = params.benId;
      this.bankId = params.banId;
      this.getClaimPaymentDetail();
      this.showBankAccount = false;
      this.createForm();
      // TODO Uncomment this after new database structure is complete
      // this.paymentDetailsFormGroup.get('txtTotalClaim').disable();
      // this.paymentDetailsFormGroup.get('txtRefund').disable();
      // this.paymentDetailsFormGroup.get('txtOutstandingPremiums').disable();
      // this.paymentDetailsFormGroup.get('txtBenefitCoverAmount').disable();
      this.currentUser = this.authService.getCurrentUser();
      this.currentUserEmail = this.currentUser.email;
      this.isAdminApproveDecline = false;
      if (this.currentUser.roleName === 'Administrator') {
        this.isAdminApproveDecline = true;
      }
    });
  }

  createForm() {
    this.clearDisplayName();
    if (this.beneficiaryDetailsFormGroup && this.bankingDetailsFormGroup && this.paymentDetailsFormGroup && this.decisionFormGroup) { return; }
    this.beneficiaryDetailsFormGroup = this.formBuilder.group({
      txtPolicyNumber: new UntypedFormControl(''),
      txtFirstName: new UntypedFormControl(''),
      txtIdentityNumber: new UntypedFormControl(''),
      txtDateOfBirth: new UntypedFormControl(''),
      txtContactNumber: new UntypedFormControl(''),
      txtClaimNumber: new UntypedFormControl(''),
      txtLastName: new UntypedFormControl(''),
      txtPassportNumber: new UntypedFormControl(''),
      txtRelationToDeceased: new UntypedFormControl(''),
      txtEmail: new UntypedFormControl('')
    });
    this.bankingDetailsFormGroup = this.formBuilder.group({
      txtNameOfAccountHolder: new UntypedFormControl(''),
      txtNameOfBank: new UntypedFormControl(''),
      txtAccountNumber: new UntypedFormControl(''),
      txtAccountType: new UntypedFormControl(''),
      txtBranchCode: new UntypedFormControl(''),
    });
    this.paymentDetailsFormGroup = this.formBuilder.group({
      txtBenefitCoverAmount: new UntypedFormControl(''),
      txtRefund: new UntypedFormControl(''),
      txtUnclaimedAmount: new UntypedFormControl(''),
      txtTotalClaim: new UntypedFormControl(''),
      txtAllocationPercentage: new UntypedFormControl(''),
      txtTracingFee: new UntypedFormControl(''),
      hdnBeneficiaryId: new UntypedFormControl(''),
      hdnClaimPaymentId: new UntypedFormControl(''),
      hdnPolicyId: new UntypedFormControl(''),
      hdnProductId: new UntypedFormControl(''),
      hdnClaimInvoiceId: new UntypedFormControl(''),
      hdnBankAccountId: new UntypedFormControl(''),
      txtOutstandingPremiums: new UntypedFormControl('')
    });
    this.decisionFormGroup = this.formBuilder.group({
      claimDecision: new UntypedFormControl('', [Validators.required]),
      reason: new UntypedFormControl(''),
      reverseReason: new UntypedFormControl(''),
      noteText: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  getClaimPaymentDetail(): void {
    this.appEventsManager.loadingStart(`Loading...`);
    this.claimCareService.GetClaimPaymentDetail(this.claimId, this.beneficiaryId, this.bankId).subscribe(
      invoice => {
        this.claimInvoice = invoice;
        if (invoice.beneficiaryDetail.beneficiaryTypeId === BeneficiaryTypeEnum.Child) {
          this.isMessageText = invoice.messageText !== null ? true : false;
          this.claimInvoice.messageText = invoice.messageText + '.' + 'Maximum amount will be paid';
        }

        this.setForm(this.claimInvoice);
        this.appEventsManager.loadingStop();
      });
  }

  setForm(item: any) {
    this.showDecisionReason = true;
    this.disableClaimAmounts();
    console.log(item);
    this.beneficiaryBankingDetails = item;

    if (item == null) { return; }
    this.checkDecisionId = item.decisionId;
    this.disableReason = false;
    this.disableNoteText = false;


    this.beneficiaryDetailsFormGroup.patchValue({
      txtPolicyNumber: item.policyNumber,
      txtFirstName: item.beneficiaryDetail.firstname,
      txtIdentityNumber: item.beneficiaryDetail.idNumber,
      txtDateOfBirth: this.datePipe.transform(item.beneficiaryDetail.dateOfBirth, 'yyyy-MM-dd'),
      txtContactNumber: item.beneficiaryDetail.contactNumber,
      txtClaimNumber: item.claimReferenceNumber,
      txtLastName: item.beneficiaryDetail.lastname,
      txtPassportNumber: item.beneficiaryDetail.passportNumber ? null : '',
      txtRelationToDeceased: item.beneficiaryDetail.relationOfDeceased,
      txtEmail: item.beneficiaryDetail.email
    });
    this.bankingDetailsFormGroup = this.formBuilder.group({
      txtNameOfAccountHolder: item.beneficiaryDetail.rolePlayerBankAccount.accountHolderName,
      txtNameOfBank: item.beneficiaryDetail.rolePlayerBankAccount.bankName,
      txtAccountNumber: item.beneficiaryDetail.rolePlayerBankAccount.accountNumber,
      txtAccountType: item.beneficiaryDetail.rolePlayerBankAccount.accountType,
      txtBranchCode: item.beneficiaryDetail.rolePlayerBankAccount.branchCode,
    });
    this.paymentDetailsFormGroup = this.formBuilder.group({
      txtBenefitCoverAmount: item.coverAmount,
      txtRefund: item.refund,
      txtUnclaimedAmount: item.unclaimedPaymentInterest ? this.decimalPipe.transform(item.unclaimedPaymentInterest, '1.2-2') : 0,
      txtTotalClaim: item.claimAmount,
      txtAllocationPercentage: item.beneficiaryDetail.allocationPercentage,
      txtTracingFee: item.tracingFees ? item.tracingFees : 0,
      hdnBeneficiaryId: item.beneficiaryDetail.beneficiaryId,
      hdnClaimPaymentId: item.claimId,
      hdnPolicyId: item.policyId,
      hdnProductId: item.productId,
      hdnClaimInvoiceId: item.id,
      hdnBankAccountId: item.beneficiaryDetail.rolePlayerBankAccount.rolePlayerBankingId,
      txtOutstandingPremiums: item.outstandingPremium
    });

    this.decisionFormGroup = this.formBuilder.group({
      claimDecision: new UntypedFormControl('', [Validators.required]),
      reason: new UntypedFormControl(''),
      reverseReason: new UntypedFormControl(''),
      noteText: [item.claimNote, [Validators.required, Validators.minLength(3)]]
    });
  }

  disableClaimAmounts() {
    this.disableAmounts = true;
    this.disableBeneficiaryCoverAmount = true;
    this.disableUnclaimedInterestAmount = true;
    this.disableAllocPercent = true;
    this.disableTracingFee = true;
  }

  enableClaimAmountsForExGratia() {
    this.disableAmounts = false;
    this.disableBeneficiaryCoverAmount = false;
    this.disableUnclaimedInterestAmount = false;
    this.disableAllocPercent = false;
    this.disableTracingFee = false;
  }

  readForm() {
    return this.beneficiaryBankingDetails;
  }

  addClaimPayment() {
    const beneficiaryDetailsFormGroup = this.beneficiaryDetailsFormGroup.value;
    const bankingDetailsFormGroup = this.bankingDetailsFormGroup.value;
    const paymentDetailsFormGroup = this.paymentDetailsFormGroup.value;
    const decisionFormGroup = this.decisionFormGroup.value;
    const claimPaymentDetailsAdd = new ClaimPaymentModel();
    claimPaymentDetailsAdd.invoiceAllocations = new Array();
    const invoiceAllocations = new InvoiceAllocation();

    claimPaymentDetailsAdd.beneficiaryId = paymentDetailsFormGroup.hdnBeneficiaryId;
    claimPaymentDetailsAdd.claimId = paymentDetailsFormGroup.hdnClaimPaymentId;
    claimPaymentDetailsAdd.claimReferenceNumber = beneficiaryDetailsFormGroup.txtClaimNumber;
    claimPaymentDetailsAdd.policyId = paymentDetailsFormGroup.hdnPolicyId;
    claimPaymentDetailsAdd.policyNumber = beneficiaryDetailsFormGroup.txtPolicyNumber;
    // claimPaymentDetailsAdd.capturedDate = formModel.dateOfPayment; -- missing field
    claimPaymentDetailsAdd.productId = paymentDetailsFormGroup.hdnProductId;
    // claimPaymentDetailsAdd.product = formModel.txtProduct; -- missing field
    claimPaymentDetailsAdd.outstandingPremium = paymentDetailsFormGroup.txtOutstandingPremiums;
    claimPaymentDetailsAdd.refund = paymentDetailsFormGroup.txtRefund;
    claimPaymentDetailsAdd.totalClaim = this.paymentDetailsFormGroup.controls.txtTotalClaim.value;
    // claimPaymentDetailsAdd.unclaimedPaymentInterest = formModel.UnclaimedInterest; -- missing field
    claimPaymentDetailsAdd.tracingFees = paymentDetailsFormGroup.TracingFee;
    claimPaymentDetailsAdd.coverAmount = paymentDetailsFormGroup.txtBenefitCoverAmount;
    claimPaymentDetailsAdd.capAmount = this.paymentDetailsFormGroup.controls.txtTotalClaim.value; // this.claimPaymentDetail.capAmount;
    // claimPaymentDetailsAdd.claimAmount = formModel.txtTotalClaim;
    claimPaymentDetailsAdd.claimAmount = this.paymentDetailsFormGroup.controls.txtTotalClaim.value;
    claimPaymentDetailsAdd.decisionReasonId = decisionFormGroup.reason;
    claimPaymentDetailsAdd.decisionId = decisionFormGroup.claimDecision;
    claimPaymentDetailsAdd.decision = decisionFormGroup.claimDecision;
    // claimPaymentDetailsAdd.bankAccountId = formModel.hdnBankAccountId; -- missing field
    // claimPaymentDetailsAdd.claimPaymentId = formModel.hdnClcPaymentId;
    // claimPaymentDetailsAdd.id = formModel.id;
    claimPaymentDetailsAdd.id = paymentDetailsFormGroup.hdnClaimInvoiceId;

    // ===========Invoice Allocation =========================//
    invoiceAllocations.beneificaryRolePlayerId = paymentDetailsFormGroup.hdnBeneficiaryId;
    invoiceAllocations.assessedAmount = this.paymentDetailsFormGroup.controls.txtTotalClaim.value;
    invoiceAllocations.assessedVat = 0;
    invoiceAllocations.paymentMethod = this.paymentMethodEnum.EFT;
    invoiceAllocations.percentAllocation = 100;
    invoiceAllocations.invoiceTypeId = this.claimInvoiceTypeEnum.FuneralExpenses;
    invoiceAllocations.invoiceAllocationStatusId = 1;
    invoiceAllocations.rolePlayerBankingId = paymentDetailsFormGroup.hdnBankAccountId;
    claimPaymentDetailsAdd.invoiceAllocations.push(invoiceAllocations);

    this.claimPaymentDetails = new Array();
    this.claimPaymentDetails.push(claimPaymentDetailsAdd);

    this.errorMessages = new Array();
    const clmAmount = this.paymentDetailsFormGroup.controls.txtTotalClaim.value;
    if (bankingDetailsFormGroup.txtAccountNumber == null || bankingDetailsFormGroup.txtAccountNumber === '' || bankingDetailsFormGroup.txtAccountNumber === undefined) {
      this.alertService.error('No bank details exist. Cannot process', 'Error', true);
      return false;
    }

    if (this.selectedClaimDecision === undefined || this.selectedClaimDecision === null) {
      this.errorMessages.push('Claim decision required');
    }

    if ((clmAmount === '0' || clmAmount === undefined || clmAmount === null) && (this.selectedClaimDecision !== this.decisionEnum.Decline)) {
      this.errorMessages.push('Total claim required');
    }

    if (this.selectedClaimDecision === this.decisionEnum.Decline && (decisionFormGroup.reason == null || decisionFormGroup.reason === 0 || decisionFormGroup.reason === '')) {
      this.errorMessages.push('Reason is mandatory if claim decision is Decline');
    }

    if (this.selectedClaimDecision === this.decisionEnum.ReAssess && (decisionFormGroup.noteText == null || decisionFormGroup.noteText === '')) {
      this.errorMessages.push('Note is mandatory if claim decision is Re-Assess');
    }

    if (this.selectedClaimDecision === this.decisionEnum.PaymentReversal && (decisionFormGroup.reverseReason == null || decisionFormGroup.reverseReason === 0 || decisionFormGroup.reverseReason === '')) {
      this.errorMessages.push('Reason is mandatory if claim decision is Payment Reversal');
    }

    if (this.errorMessages.length > 0) {
      this.messages = '';
      this.errorMessages.forEach(element => {
        this.messages = this.messages + element + ' ,';
      });
      this.messages = this.messages.slice(0, this.messages.length - 1);
      this.alertService.error(this.messages, 'Error', true);
      return false;
    }

    this.isLoading = true;
    this.isProcessing = true;
    this.alertService.loading(`Processing...`, 'Processing', true);
    this.claimCareService.CreateClaimPayment(this.claimPaymentDetails).subscribe(validationResult => {
      if (validationResult.result) {
        if (this.selectedClaimDecision === this.decisionEnum.ReAssess && (decisionFormGroup.noteText != null && decisionFormGroup.noteText !== '')) {
          const note = new Note();
          if (decisionFormGroup.reason > 0){
           note.reason = this.reasons.find(r => r.id === decisionFormGroup.reason).reason;
          }

          note.text = decisionFormGroup.noteText.trim() as string;
          note.itemId = this.claimId;
          note.itemType = 'Claim';
          note.isActive = true;
          note.modifiedBy = this.currentUserEmail;
          this.notesService.addNote(ServiceTypeEnum.ClaimManager, note).subscribe();
        }

        this.alertService.success(validationResult.message[0], 'Success', true);
        this.router.navigateByUrl('claimcare/claim-manager/claim-workpool');
      } else {
        this.alertService.error(validationResult.message[0], 'Error', true);
      }
    });
  }

  claimDecisionChanged($event: any) {
    this.selectedClaimDecision = $event.value as number;
    if (this.selectedClaimDecision === this.decisionEnum.Decline) {
      this.disableReason = false;
    } else {
      this.decisionFormGroup.get('reason').setValue(null);
      this.disableReason = true;
    }
    if (this.selectedClaimDecision === this.decisionEnum.ReAssess || this.selectedClaimDecision === this.decisionEnum.RejectReversal) {
      this.disableNoteText = false;
    } else {
      this.disableNoteText = true;
    }
  }

  // // Changing the Total claim amounts on focusOut
  onInterestChange(event: any) {
    const unclaimed = event.target.value;
    const paymentDetailsFormGroup = this.paymentDetailsFormGroup.value;
    const traceFee = parseFloat(this.paymentDetailsFormGroup.get('txtTracingFee').value);
    if (unclaimed === '') {
      this.paymentDetailsFormGroup.patchValue({
        txtUnclaimedAmount: 0,
        txtTotalClaim: parseFloat(paymentDetailsFormGroup.txtBenefitCoverAmount) - traceFee
      });
    } else {
      this.paymentDetailsFormGroup.patchValue({
        txtTotalClaim: parseFloat(paymentDetailsFormGroup.txtBenefitCoverAmount) + parseFloat(unclaimed) - traceFee
      });
    }
  }

  onTraceFeeChanged(event: any) {
    const traceFee = event.target.value;
    const paymentDetailsFormGroup = this.paymentDetailsFormGroup.value;
    const unclaimed = parseFloat(this.paymentDetailsFormGroup.get('txtUnclaimedAmount').value);
    if (traceFee === '') {
      this.paymentDetailsFormGroup.patchValue({
        txtTracingFee: 0,
        txtTotalClaim: parseFloat(paymentDetailsFormGroup.txtBenefitCoverAmount) + unclaimed
      });
    } else {
      this.paymentDetailsFormGroup.patchValue({
        txtTotalClaim: parseFloat(paymentDetailsFormGroup.txtBenefitCoverAmount) + unclaimed - parseFloat(traceFee)
      });
    }
  }

  save() { }

  back() {
    this.router.navigateByUrl('claimcare/claim-manager/claim-workpool');
  }

  approveDecline() {
  }

  emailBeneficiary() {
    const beneficiaryDetailsFormGroup = this.beneficiaryDetailsFormGroup.value;
    const decisionFormGroup = this.decisionFormGroup.value;
    const claimPaymentDetailsAdd = new ClaimPaymentModel();
    const paymentDetailsFormGroup = this.paymentDetailsFormGroup.value;

    claimPaymentDetailsAdd.claimantEmail = beneficiaryDetailsFormGroup.txtEmail;
    claimPaymentDetailsAdd.telephoneNumber = beneficiaryDetailsFormGroup.txtContactNumber
    claimPaymentDetailsAdd.mobileNumber = beneficiaryDetailsFormGroup.txtContactNumber;
    claimPaymentDetailsAdd.beneficiaryId = paymentDetailsFormGroup.hdnBeneficiaryId;
    claimPaymentDetailsAdd.claimId = paymentDetailsFormGroup.hdnClaimPaymentId;
    claimPaymentDetailsAdd.claimReferenceNumber = beneficiaryDetailsFormGroup.txtClaimNumber;
    claimPaymentDetailsAdd.policyId = paymentDetailsFormGroup.hdnPolicyId;
    claimPaymentDetailsAdd.policyNumber = beneficiaryDetailsFormGroup.txtPolicyNumber;
    claimPaymentDetailsAdd.productId = paymentDetailsFormGroup.hdnProductId;

    claimPaymentDetailsAdd.claimAmount = this.paymentDetailsFormGroup.controls.txtTotalClaim.value;
    claimPaymentDetailsAdd.decisionReasonId = decisionFormGroup.reason;
    claimPaymentDetailsAdd.decisionId = decisionFormGroup.claimDecision;
    claimPaymentDetailsAdd.decision = decisionFormGroup.claimDecision;
    claimPaymentDetailsAdd.id = paymentDetailsFormGroup.hdnClaimInvoiceId;

    this.claimPaymentDetails = new Array();
    this.claimPaymentDetails.push(claimPaymentDetailsAdd);

    this.claimCareService.SendRecoveryEmail(this.claimPaymentDetails).subscribe(validationResult => {
      if (validationResult.result) {
        if (decisionFormGroup.noteText != null && decisionFormGroup.noteText !== '') {
          const note = new Note();
          if (decisionFormGroup.reason > 0) {
          note.reason = this.reasons.find(r => r.id === decisionFormGroup.reason).reason;
          }

          note.text = decisionFormGroup.noteText.trim() as string;
          note.itemId = this.claimId;
          note.itemType = 'Claim';
          note.isActive = true;
          note.modifiedBy = this.currentUserEmail;
          this.notesService.addNote(ServiceTypeEnum.ClaimManager, note).subscribe();
        }
        this.alertService.success(validationResult.message[0], 'Success', true);
        this.router.navigateByUrl('claimcare/claim-manager/claim-workpool');
      } else {
        this.alertService.error(validationResult.message[0], 'Error', true);
      }
    });
  }

  smsBeneficiary() { }
}

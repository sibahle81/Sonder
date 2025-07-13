
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { RegisterFuneralModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/register-funeral.model';
import { FuneralRuleResult } from '../../../shared/entities/funeral/funeral-rule-result';
import { ClaimCancellationReasonsModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim-cancellation-reasons.model';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { StatusType } from 'projects/claimcare/src/app/claim-manager/shared/enums/status.enum';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { WorkPoolUpdateStatus } from '../../../shared/entities/funeral/work-pool.model';
import { PaymentStatusEnum } from 'projects/fincare/src/app/shared/enum/payment-status-enum';

@Component({
  selector: 'app-reverse-claim-payment',
  templateUrl: './reverse-claim-payment.component.html',
  styleUrls: ['./reverse-claim-payment.component.css']
})
export class ReverseClaimPaymentComponent extends DetailsComponent implements OnInit {
  selectedFilterTypeId = 0;
  claimCancelReasons: ClaimCancellationReasonsModel[];
  beneficiaryId = 0;
  claimId: number;
  bankId: number;
  isProcessing: boolean;
  isLoading: boolean;
  ruleResult: FuneralRuleResult;
  ruleResultMessages: string[];
  registerFuneralModel = new RegisterFuneralModel();
  errorMessages: any[];
  messages: any;
  selectedNote: Note;
  currentUser: User;
  currentUserEmail: string;
  notesRequest: NotesRequest;
  selectedCancelReason: string;
  statusEnum = StatusType;
  claimReference: string;
  claimAmount: number;
  paymentStatus: string;
  paymentId: number;
  paymentStatusEnum = PaymentStatusEnum;

  constructor(
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly router: Router,
    dateAdapter: DateAdapter<NativeDateAdapter>,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimCareService: ClaimCareService,
    private readonly authService: AuthService,
    private readonly paymentService: PaymentService,
    private readonly notesService: NotesService) {
    super(appEventsManager, alertService, router, '', '', 1);
    dateAdapter.setLocale('en-za');
    this.ruleResultMessages = new Array();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.claimId = params.id;
      this.beneficiaryId = params.benId;
      this.bankId = params.banId;
      this.currentUser = this.authService.getCurrentUser();
      this.currentUserEmail = this.currentUser.email;
      this.getLookups();
      this.getClaimPaymentDetail(this.claimId);
      this.createForm(params.id);
    });
  }

  getLookups() {
    this.claimCareService.GetClaimCancellationReasons().subscribe(reasons => {
      this.claimCancelReasons = reasons;
    });
  }

  createForm(id: any): void {
    this.clearDisplayName();
    this.form = this.formBuilder.group({
      id,
      beneficiaries: new UntypedFormControl(''),
      text: ['', [Validators.required, Validators.minLength(3)]],
      filter: new UntypedFormControl(''),
    });
  }

  patchBankingForm() {
    this.form.patchValue({

    });
  }

  selectedReasonChanged($event: any) {
    const target = $event.source.selected._element.nativeElement;
    const selectedData = {
      value: $event.value,
      text: target.innerText.trim()
    };
    this.selectedCancelReason = selectedData.text;
  }

  readForm(): Note {
    const formModel = this.form.value;
    this.selectedNote = new Note();
    this.selectedNote.reason = this.selectedCancelReason;
    this.selectedNote.text = formModel.text.trim();
    this.selectedNote.itemId = this.claimId;
    this.selectedNote.itemType = 'Claim'
    this.selectedNote.modifiedBy = this.currentUserEmail;
    return this.selectedNote;
  }

  getClaimPaymentDetail(id: number): void {
    this.appEventsManager.loadingStart(`Loading details...`);
    this.isLoading = true;

    this.claimCareService.GetClaimPaymentDetail(id, this.beneficiaryId, this.bankId).subscribe(claimPayment => {
      this.claimAmount = claimPayment.claimAmount;
      this.claimId = claimPayment.claimId;
      this.claimCareService.getClaimById(id).subscribe(claim => {
        this.claimReference = claim.claimUniqueReference;
        // if(claimPayment.paymentId == null){
        // this.paymentStatus = 'Not Submitted';
        // }else if(claim.claimStatusId == this.statusEnum.Paid){
        //   this.paymentStatus = 'Paid';
        // }else if(claim.claimStatusId == this.statusEnum.Unpaid){
        //   this.paymentStatus = 'Unpaid';
        // }
      });
      this.isLoading = false;
    });

    this.appEventsManager.loadingStop();
  }

  setForm(item: any) {
    if (item == null) { return; }
    this.form.patchValue({
    });
  }

  save() { }

  acceptPaymentReversal() {
    const formModel = this.form.value;
    this.errorMessages = new Array();
    if (formModel.text == null || formModel.text === undefined || formModel.text === '') {
      this.errorMessages.push('Reversal note is required');
    }
    if (formModel.filter == null || formModel.filter === 0) {
      this.errorMessages.push('Reversal reason is mandatory');
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

    this.isProcessing = true;
    this.alertService.loading(`Processing...`, 'Processing', true);
    const note = this.readForm();
    this.notesService.addNote(ServiceTypeEnum.ClaimManager, note).subscribe(() => this.done('added'));
  }

  done(action: string): void {
    if (action === 'added') {
      this.getPaymentAndUpdatePayment(this.claimId);
    }

    this.alertService.success(`The note has been ${action}.`);
  }

  returnToAssessor() {
  }

  getPaymentAndUpdatePayment(id: number) {
    let workPoolUpdateStatus = new WorkPoolUpdateStatus();
    workPoolUpdateStatus.claimId = this.claimId;
    workPoolUpdateStatus.itemId = this.claimId;
    if (id > 0 || id != null) {
      this.paymentService.getPaymentByClaimId(id).subscribe(payment => {
        if (this.paymentStatus == 'Paid' && payment.paymentStatus == this.paymentStatusEnum.Paid || payment.paymentStatus == this.paymentStatusEnum.Reconciled) {
          workPoolUpdateStatus.status = this.statusEnum.Reversed;
        }
        this.paymentService.reversePayment(payment).subscribe(() => {
          this.alertService.success('Payment reversal successfully.');
        });
        this.claimCareService.updateWorkPoolStatus(workPoolUpdateStatus).subscribe(res => {
          this.router.navigateByUrl('claimcare/claim-manager/claim-workpool');
        });
      });
    }
  }

  back() {
    this.router.navigateByUrl('claimcare/claim-manager/claim-workpool');
  }

  stopLoading(): void {
    this.appEventsManager.loadingStop();
  }
}


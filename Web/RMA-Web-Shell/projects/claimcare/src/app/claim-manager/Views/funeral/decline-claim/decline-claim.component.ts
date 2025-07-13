import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BankAccount, BeneficiaryBankDetail } from '../../../../../../../shared-components-lib/src/lib/beneficiary-banking-detail/beneficiary-bank-detail.model';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ClaimPaymentModel } from '../../../shared/entities/funeral/claim-payment.model';
import { BankAccountService } from 'projects/clientcare/src/app/client-manager/shared/services/bank-account.service';
import { DatePipe } from '@angular/common';
import { RegisterFuneralModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/register-funeral.model';
import { FuneralService } from '../../../Services/funeral.service';
import { FuneralRuleResult } from '../../../shared/entities/funeral/funeral-rule-result';

@Component({
  selector: 'app-decline-claim',
  templateUrl: './decline-claim.component.html',
  styleUrls: ['./decline-claim.component.css']
})

export class DeclineClaimComponent extends DetailsComponent implements OnInit {
  claimPaymentDetails: ClaimPaymentModel[];
  claimPaymentDetail: ClaimPaymentModel;
  claimPaymentDetailBeneficiary: BeneficiaryBankDetail;
  claimPaymentDetailBankAccount: BankAccount;
  beneficiaryBankingDetails: BeneficiaryBankDetail[];
  claimRef: any;
  dateValue: any;
  claimId: number;
  isProcessing: boolean;
  isLoading: boolean;
  ruleResult: FuneralRuleResult;
  ruleResultMessages: string[];
  registerFuneralModel = new RegisterFuneralModel();

  constructor(
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly router: Router,
    dateAdapter: DateAdapter<NativeDateAdapter>,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimCareService: ClaimCareService,
    private readonly bankAccountService: BankAccountService,
    private readonly datePipe: DatePipe,
    private readonly lookUpService: LookupService,
    private readonly funeralService: FuneralService) {
    super(appEventsManager, alertService, router, '', '', 1);
    dateAdapter.setLocale('en-za');
    this.claimPaymentDetail = new ClaimPaymentModel();
    this.claimPaymentDetailBeneficiary = new BeneficiaryBankDetail();
    this.claimPaymentDetailBankAccount = new BankAccount();
    this.ruleResultMessages = new Array();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.claimId = params.id;
      this.getClaimPaymentDetail(this.claimId);
      this.createForm(params.id);
    });
  }

  createForm(id: any): void {
    this.clearDisplayName();
    this.form = this.formBuilder.group({
      id,
      beneficiaries: new UntypedFormControl(''),
    });
  }

  patchBankingForm() {
    this.form.patchValue({
      // bank: this.selectedBankAccountforEdit.bankId,
    });
  }

  readForm() {
    return this.claimPaymentDetails;
  }

  getClaimPaymentDetail(id: number): void {
    this.appEventsManager.loadingStart(`Getting claim details...`);
    this.claimCareService.GetClaimAndPaymentDetailsForDecline(id).subscribe(
      detail => {
        this.claimPaymentDetail = detail;
        this.claimPaymentDetailBeneficiary = detail.beneficiaryDetail;
        this.claimPaymentDetailBankAccount = detail.beneficiaryDetail.bankAccount;
        this.claimRef = this.claimPaymentDetail.claimReferenceNumber;
        this.dateValue = this.datePipe.transform(this.claimPaymentDetail.capturedDate, 'yyyy-MM-dd');

        // Get the Rule results :
        this.registerFuneralModel.claimId = id;
        this.registerFuneralModel.policyId = detail.policyId;
        this.registerFuneralModel.insuredLifeId = detail.beneficiaryDetail.insuredLifeId;

        this.appEventsManager.loadingStart(`Getting rules...`);
        this.funeralService.getFuneralClaimRegistrationRules(this.registerFuneralModel.ruleResult).subscribe(result => {
          this.ruleResult = result;
          this.registerFuneralModel.ruleResult = this.ruleResult;

          for (let key in this.ruleResult.messageList) {
            this.ruleResultMessages.push(this.ruleResult.messageList[key]);
          }

          // this.ruleResultMessages = this.ruleResult.messageList;
        });

        this.setForm(this.claimPaymentDetail);
        this.appEventsManager.loadingStop();
      });
  }

  setForm(item: any) {
    this.claimPaymentDetail = item;
    if (item == null) { return; }
    this.form.patchValue({
      // clmRef: item.claimReferenceNumber
    });
  }

  save() { }

  acceptDeclinedClaim() {
    this.isLoading = true;
    this.isProcessing = true;
    this.alertService.loading(`Processing...`, 'Processing', true);
    this.claimCareService.SendDeclineLetterToClaimant(this.registerFuneralModel).subscribe(result => {

      if (result) {
        this.alertService.success('Success', 'Success', true);
        this.router.navigateByUrl('claimcare/claim-manager/funeral/work-pool-list');
      } else {
        this.alertService.error('Error', 'Error', true);
      }
    });
  }

  returnToAssessor() {
  }

  back() {
    this.router.navigateByUrl('claimcare/claim-manager/funeral/work-pool-list');
  }

  stopLoading(): void {
    this.appEventsManager.loadingStop();
  }
}

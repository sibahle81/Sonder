import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { UnclaimBnefitsValuesService } from '../unclaim-bnefits-values.service';
import { ClaimTracerInvoice } from 'projects/clientcare/src/app/policy-manager/shared/entities/claim-tracer-invoice';
import { forkJoin, Subscription } from 'rxjs';
import { ClaimsCalculatedAmount } from 'projects/clientcare/src/app/policy-manager/shared/entities/claims-calculated-amount';

@Component({
  selector: 'app-unclaimed-benefit',
  templateUrl: './unclaimed-benefit.component.html',
  styleUrls: ['./unclaimed-benefit.component.css'],
})
export class UnclaimedBenefitComponent extends DetailsComponent implements OnInit, OnDestroy {

  public form: UntypedFormGroup;
  public maxDate: Date;
  public minDate: Date;
  public startDate: Date;
  public endDate: Date;

  private calculatedAmountSubcription: Subscription;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private unclaimedBenefitsValuesService: UnclaimBnefitsValuesService,
    private appEventsManager: AppEventsManager
  ) {
    super(appEventsManager, alertService, router, '', '', 1);
  }

  public ngOnInit(): void {
    this.createForm('one');
    let claimTracerInvoice: ClaimTracerInvoice = null;
    let claimsCalculatedAmount: ClaimsCalculatedAmount = null;
    const dt = this.minDate = new Date();
    dt.setDate(dt.getDate() - 1);

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.claimId) {
        this.calculatedAmountSubcription = forkJoin(
          this.unclaimedBenefitsValuesService
            .GetUnclaimedBenefitByClaimId(143),
          this.unclaimedBenefitsValuesService.GetClaimsCalculatedAmountByClaimId(143))
          .subscribe(data => {
            claimTracerInvoice = data[0];
            claimsCalculatedAmount = data[1];
          }, (error) => {
            console.log(error);
          }, () => {
            this.form.patchValue({
              investigationAmount: claimTracerInvoice ? claimTracerInvoice.tracingFee : 0,
              investigationFeeDate: claimTracerInvoice ? claimTracerInvoice.payDate : null,
              unclaimedBenefitAmount: claimsCalculatedAmount.totalAmount
            });
          });
      }
    });
  }

  public ngOnDestroy(): void {
    if (this.calculatedAmountSubcription) {
      this.calculatedAmountSubcription.unsubscribe();
    }
  }

  public createForm(id: string): void {
    this.form = this.formBuilder.group({
      unclaimedBenefitAmount: new UntypedFormControl(''),
      startDate: new UntypedFormControl(''),
      endDate: new UntypedFormControl(''),
      investigationAmount: new UntypedFormControl(''),
      investigationFeeDate: new UntypedFormControl('')
    });
  }

  public readForm(): void {

  }

  public setForm(item: any): void {

  }

  public save(): void {
    const formModel = this.form.getRawValue();
    const unclaimedBenefitAmount = formModel.unclaimedBenefitAmount;
    const startdate = formModel.startDate;
    const enddate = formModel.endDate;
    const investigationAmount = formModel.investigationAmount;
    const investigationfeeDate = formModel.investigationFeeDate;

    // this.unclaimedBenefitsValuesService.getUnclaimedBenefitInvestmentAmount
    // (unclaimedBenefitAmount,startdate,enddate,investigationAmount,investigationfeeDate)
  }
}

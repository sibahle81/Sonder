import { AfterViewInit, Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { TermArrangementService } from 'projects/fincare/src/app/shared/services/term-arrangement.service';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-memo-of-agreement',
  templateUrl: './memo-of-agreement.component.html',
  styleUrls: ['./memo-of-agreement.component.css']
})
export class MemoOfAgreementComponent implements OnInit, OnDestroy {
  parametersAudit: any;
  reportTitle = 'Memo Of Agreement';
  reportServerAudit: string;
  reportUrlAudit = 'RMA.Reports.FinCare/RMATermsMOATwoPeriods';
  showParametersAudit = 'false';
  languageAudit = 'en-us';
  widthAudit = 100;
  heightAudit = 100;
  toolbarAudit = 'true';
  showReport = true;
  formatAudit = 'PDF';
  form: UntypedFormGroup;
  isSending$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  recipientEmail: string;
  termArrangementId: number;
  termIdChangedSubscription: Subscription;
  reportParametersLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() roleplayerIndustryClass: IndustryClassEnum;

  constructor(private readonly lookupService: LookupService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastr: ToastrManager,
    private termArrangementService: TermArrangementService) {
  }

  ngOnDestroy(): void {
    this.termIdChangedSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      ownerEmail: [null, [Validators.email]]
    });
    this.termIdChangedSubscription = this.termArrangementService.termArrangementDetails$.subscribe(
      data => {
        if (data.termArrangementId > 0) {
          this.reportParametersLoaded$.next(false);
          this.termArrangementId = data.termArrangementId;
          if (data.balance > 0 && this.roleplayerIndustryClass && this.roleplayerIndustryClass === +IndustryClassEnum.Metals) {
            this.reportServerAudit = data.reportServerAudit;
            this.parametersAudit = { termArrangementId: data.termArrangementId, balance: data.balance, year: data.year, showBalanceMessage:true, bankaccountId: data.bankaccountId };
          }
          else {
            this.reportServerAudit = data.reportServerAudit;
            this.parametersAudit = { termArrangementId: data.termArrangementId, balance: 0, year: 0, showBalanceMessage:false, bankaccountId: data.bankaccountId };
          }
          this.reportParametersLoaded$.next(true);
        }
      }

    );
  }

  onEmailChange(emailValue: string): void {
    this.form.get('ownerEmail').setValue(emailValue);
  }

  sendMemoOfAgreeMent() {
    this.isSending$.next(true);
    this.termArrangementService.sendMemoOfAgreement(this.form.get('ownerEmail').value, this.termArrangementId).subscribe(
      () => {
        this.toastr.successToastr('Email sent successfully');
        this.isSending$.next(false);
      },
      (error) => {
        this.toastr.errorToastr(error.message);
        this.isSending$.next(false);
      }
    );
  }
}

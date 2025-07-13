import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { TermArrangementService } from 'projects/fincare/src/app/shared/services/term-arrangement.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'terms-moa',
  templateUrl: './terms-moa.component.html',
  styleUrls: ['./terms-moa.component.css']
})
export class TermsMoaComponent implements OnInit {
  @Input() rolePlayer: RolePlayer;

  parametersAudit: any;
  reportTitle = 'Memo Of Agreement';
  reportServerAudit: string;
  reportUrlAudit = 'RMA.Reports.FinCare/RMATermsMOAReport';
  showParametersAudit = 'false';
  languageAudit = 'en-us';
  widthAudit = 100;
  heightAudit = 100;
  toolbarAudit = 'true';
  showReport = true;
  formatAudit = 'PDF';
  form: UntypedFormGroup;
  isSending$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  termArrangementId: number;
  termIdChangedSubscription: Subscription;
  reportParametersLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private readonly lookupService: LookupService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastr: ToastrManager,
    private termArrangementService: TermArrangementService) { }

    ngOnInit(): void {
      this.form = this.formBuilder.group({
      });
      this.termIdChangedSubscription = this.termArrangementService.termArrangementDetails$.subscribe(
        data => {
          if (data.termArrangementId > 0) {
            this.reportParametersLoaded$.next(false);
            this.termArrangementId = data.termArrangementId;
            if (data.balance > 0) {
              this.reportServerAudit = data.reportServerAudit;
              this.reportUrlAudit = 'RMA.Reports.FinCare/RMATermsMOATwoPeriods';
              this.parametersAudit = { termArrangementId: data.termArrangementId, balance: data.balance, year: data.year };
            }
            else {
              this.reportServerAudit = data.reportServerAudit;
              this.reportUrlAudit = 'RMA.Reports.FinCare/RMATermsMOAReport';
              this.parametersAudit = { termArrangementId: data.termArrangementId };
            }
            this.reportParametersLoaded$.next(true);
          }
        }
      );
    }
}

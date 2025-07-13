import { AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewRef } from '@angular/core';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { CreditNoteAccount } from '../../../models/credit-note-account';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountSearchResult } from 'projects/fincare/src/app/shared/models/account-search-result';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BehaviorSubject } from 'rxjs';
import { CollectionsService } from '../../../services/collections.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { FinPayee } from 'projects/clientcare/src/app/policy-manager/shared/entities/fin-payee';
import { AccountSearchComponent } from 'projects/shared-components-lib/src/lib/account-search/account-search.component';
import { TransactionsService } from '../../../services/transactions.service';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';

@Component({
  selector: 'app-credit-note-find-account',
  templateUrl: './credit-note-find-account.component.html'
})
export class CreditNoteFindAccountComponent implements OnInit {

  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  message: string;
  @ViewChild('search', { static: true }) accountSearchComponent: AccountSearchComponent;

  constructor(
    private readonly wizardService: WizardService,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly collectionsService: CollectionsService,
    private readonly toastr: ToastrManager,
    private readonly activatedRoute: ActivatedRoute,
    private readonly transactionsService: TransactionsService
  ) { }


  ngOnInit() {
    this.activatedRoute.params.subscribe(
      (params: any) => {
        if (params.finPayeNumber) {
          if (params.type === 'INT') {
            this.createInterestCreditNote(params.roleplayerId, params.finPayeNumber);
          }
        }
      }
    );
  }

  onAccountSelected($event: AccountSearchResult) {
    this.message = `...searching for unpaid invoices for account ${$event.finPayeNumber}`;
    this.isSubmitting$.next(true);

    this.collectionsService.getUnpaidInvoices($event.rolePlayerId, false).subscribe(results => {
      if (results && results.length > 0) {
        const creditNoteAccount = new CreditNoteAccount();
        creditNoteAccount.finPayeNumber = $event.finPayeNumber;

        const startwizardRequest = new StartWizardRequest();
        startwizardRequest.type = 'credit-note';
        startwizardRequest.linkedItemId = -1;
        startwizardRequest.data = JSON.stringify(creditNoteAccount);

        this.wizardService.startWizard(startwizardRequest).subscribe(wizard => {
          this.message = `...creating credit note wizard`;
          this.router.navigateByUrl(`/fincare/billing-manager/credit-note/continue/${wizard.id}`);
        }, error => { this.toastr.errorToastr(error.message); this.isSubmitting$.next(false); });
      } else { this.toastr.errorToastr(`There are no unpaid invoices for ${$event.finPayeNumber} to perform a credit note against`); this.isSubmitting$.next(false); }
    });
  }

  createInterestCreditNote(roleplayerId: number, finPayeNumber: string) {
    this.message = `...searching for interest transactions for account ${finPayeNumber}`;
    this.isSubmitting$.next(true);

    this.transactionsService.getTransactionByRoleplayerIdAndTransactionType(roleplayerId, TransactionTypeEnum.Interest).subscribe(results => {
      if (results && results.length > 0) {
        const creditNoteAccount = new CreditNoteAccount();
        creditNoteAccount.finPayeNumber = finPayeNumber;

        const startwizardRequest = new StartWizardRequest();
        startwizardRequest.type = 'credit-note-debit-reversal';
        startwizardRequest.linkedItemId = -1;
        startwizardRequest.data = JSON.stringify(creditNoteAccount);

        this.wizardService.startWizard(startwizardRequest).subscribe(wizard => {
          this.message = `...creating credit note wizard`;
          this.router.navigateByUrl(`/fincare/billing-manager/credit-note-debit-reversal/continue/${wizard.id}`);
        }, error => { this.toastr.errorToastr(error.message); this.isSubmitting$.next(false); });
      } else { this.toastr.errorToastr(`There are no interest transactions for ${finPayeNumber} to perform a credit note against`); this.isSubmitting$.next(false); }
    });
  }
}

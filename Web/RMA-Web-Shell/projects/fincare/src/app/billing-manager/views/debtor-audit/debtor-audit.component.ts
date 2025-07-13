import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DebtorSearchResult } from '../../../shared/models/debtor-search-result';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
  selector: 'app-debtor-audit',
  templateUrl: './debtor-audit.component.html',
  styleUrls: ['./debtor-audit.component.css']
})
export class DebtorAuditComponent implements OnInit {

  panelOpenState$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  submitDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  currentQuery: string;
  rowCount: number;
  form: UntypedFormGroup;
  rolePlayerId = 0;
  finPayeNumber = '';
  rolePlayerName = '';
  debtorSearchResult: DebtorSearchResult;
  parametersAudit: any;
  reportTitle = 'Debtor Audit';
  reportServerAudit: string;
  reportUrlAudit = 'RMA.Reports.FinCare/RMADebtorNotesAudit';
  showParametersAudit = 'false';
  languageAudit = 'en-us';
  widthAudit = 100;
  heightAudit = 100;
  toolbarAudit = 'true';
  showReport = true;
  formatAudit = 'PDF';
  ssrsBaseUrl = '';
  constructor(private readonly lookupService: LookupService) { }

  ngOnInit(): void {
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
    });

  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.panelOpenState$.next(false);
    this.rolePlayerId = debtorSearchResult.roleplayerId;
    this.rolePlayerName = debtorSearchResult.displayName;
    this.finPayeNumber = debtorSearchResult.finPayeNumber;
    this.getDebtorAuditNotes();
  }

  getDebtorAuditNotes() {
    this.reportServerAudit = this.ssrsBaseUrl;
    this.parametersAudit = { roleplayerId: this.rolePlayerId };
  }
}

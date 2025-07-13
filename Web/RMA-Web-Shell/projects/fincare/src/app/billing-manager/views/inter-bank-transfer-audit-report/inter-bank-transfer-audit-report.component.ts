import { BehaviorSubject } from 'rxjs';
import { RmaBankAccount } from './../../models/rmaBankAccount';
import { Component, OnInit } from '@angular/core';
import { InterBankTransferService } from '../../services/interbanktransfer.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-inter-bank-transfer-audit-report',
  templateUrl: './inter-bank-transfer-audit-report.component.html'
})
export class InterBankTransferAuditReportComponent implements OnInit {

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  showReport: boolean;
  selectedBankAccount: string;

  rmaBankAccounts: RmaBankAccount[];

  constructor(
    private readonly interBankTransferService: InterBankTransferService,
    private readonly formbuilder: UntypedFormBuilder,
    private readonly alertService: AlertService,
    private readonly toastr: ToastrManager
  ) { }

  ngOnInit() {
    this.getRmaBankAccounts();
    this.createForm();
  }

  createForm() {
    this.form = this.formbuilder.group({
      account: [null],
    });
  }

  getRmaBankAccounts() {
    this.isLoading$.next(true);
    this.interBankTransferService.getRmaBankAccounts().subscribe(results => {
      this.rmaBankAccounts = results;
      this.isLoading$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoading$.next(false); });
  }

  onAccountSelected($event) {
    this.showReport = true;
    this.selectedBankAccount = $event.value as string;
  }

  onReset() {
    this.showReport = false;
    this.selectedBankAccount = null;
    this.form.controls.account.reset();
  }
}

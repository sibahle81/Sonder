import { Component, OnInit, ViewChild } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { InterDebtorTransfer } from '../../../models/interDebtorTransfer';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { NativeDateAdapter, DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InterDebtorTransfersApprovalDataSource } from './inter-debtor-transfers.approval.datasource';
import { DatePipe } from '@angular/common';
import { InterDebtorTransferDocumentsComponent } from '../../inter-debtor-transfer-documents/inter-debtor-transfer-documents.component';
@Component({
  selector: 'app-inter-debtor-transfers-approval',
  templateUrl: './inter-debtor-transfers-approval.component.html',
  styleUrls: ['./inter-debtor-transfers-approval.component.css']
})
export class InterDebtorTransfersApprovalComponent extends WizardDetailBaseComponent<InterDebtorTransfer>  implements OnInit {
  form: UntypedFormGroup;
  backLink = '/fincare/billing-manager';
  displayedColumns = ['rmaReference', 'amount', 'unallocatedAmount', 'transactionDate', 'transferAmount'];
  isDocuments = 0;
  hideDocuments = true;
  requestCode: string;
  @ViewChild(InterDebtorTransferDocumentsComponent, { static: true }) documentsComponent: InterDebtorTransferDocumentsComponent;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(appEventsManager: AppEventsManager,
              authService: AuthService,
              activatedRoute: ActivatedRoute,
              private readonly formBuilder: UntypedFormBuilder,
              public readonly dataSource: InterDebtorTransfersApprovalDataSource,
              private readonly datePipe: DatePipe,
              private readonly dateAdapter: DateAdapter<NativeDateAdapter>) {
    super(appEventsManager, authService, activatedRoute);
    this.createForm(0);
  }

  ngOnInit() {
    this.dataSource.setControls(this.paginator, this.sort);
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      transferAmount: [null],
      toDebtorAccount: [null],
      fromDebtorAccount: [null],
      toDebtorNumber: [null],
      fromDebtorNumber: [null]
     });
  }

  populateModel(): void {
  }

  populateForm(): void {
    if (this.model) {
      this.hideDocuments = false;
      this.requestCode = this.model.receiverAccountNumber;
      this.form.patchValue({
        fromDebtorNumber: this.model.fromDebtorNumber,
        toDebtorNumber: this.model.receiverDebtorNumber,
        transferAmount: this.model.transferAmount,
        toDebtorAccount: this.model.receiverAccountNumber,
        fromDebtorAccount: this.model.fromAccountNumber
      });
    }

    this.dataSource.getData(this.model.transactions);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model.transactions && this.model.transactions.length === 0) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('There are no credit balances to transfer.');
  } else {
    if (this.documentsComponent.dataSource.data && this.documentsComponent.dataSource.data.length > 0 && this.documentsComponent.dataSource.data[0].id === 0) {
      validationResult.name = 'Supporting Documents';
      validationResult.errors++;
      validationResult.errorMessages.push('Supporting document for inter debtor transfer is required');
    }
  }
    return validationResult;
  }

  onLoadLookups(): void {
    throw new Error('Method not implemented.');
  }
}

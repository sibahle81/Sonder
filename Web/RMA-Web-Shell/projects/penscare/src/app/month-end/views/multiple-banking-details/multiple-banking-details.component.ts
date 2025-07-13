import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { LedgerBankingDetail } from 'projects/shared-components-lib/src/lib/models/ledger-banking-details.model';
import { MultipleBankingDetailNotification } from 'projects/shared-components-lib/src/lib/models/multiple-banking-detail-notification.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

class EntryErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return (control && control.invalid);
  }
}

@Component({
  selector: 'app-multiple-banking-details',
  templateUrl: './multiple-banking-details.component.html',
  styleUrls: ['./multiple-banking-details.component.css']
})
export class MultipleBankingDetailsComponent extends WizardDetailBaseComponent<MultipleBankingDetailNotification> implements OnInit{
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  viewMode = false;
  matcher = new EntryErrorStateMatcher();

  displayedColumns = ['accountNumber', 'accountType', 'branchCode', 'accountHolderSurname'];

  dataSource: any;

  metaData = {
    displayedColumns: ['accountNumber', 'accountType', 'branchCode', 'accountHolder', "action"],
    columnDef: {
       "accountNumber": {
         displayName: "Account Number",
         type: "text",
         sortable: true,
       },
       "accountType": {
        displayName: "Account Type",
        type: "text",
        sortable: true,
      },
      "branchCode": {
        displayName: "Branch Code",
        type: "text",
        sortable: true,
      },
      "accountHolder": {
        displayName: "Account Holder",
        type: "text",
        sortable: true,
      },
      "action": {
        displayName: "Action",
        type: "button",
        sortable: false,
      }
    }
  }

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    private formBuilder: UntypedFormBuilder,
    activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef) {
    super(appEventsManager, authService, activatedRoute);
  }


  ngOtnInit() {
    this.createForm();
  }

  setDataSource (data: any): void {
      this.dataSource = new MatTableDataSource(data);
      setTimeout(() => this.dataSource.sort = this.sort);
      setTimeout(() => this.dataSource.paginator = this.paginator);
  }

  mapTableData(tableData: any): void {
    return tableData.map(el => {
        el.accountHolder = `${el.accountHolderName} ${el.accountHolderSurname}`;
        return el;
    });
  }

  createForm(): void {
    if (this.form) return;
    this.form = this.formBuilder.group({
      bankingDetail: this.formBuilder.array([])
    })
  }

  get bankingDetail() {
    return this.form.controls["bankingDetail"] as UntypedFormArray;
  }

  createBankingDetail(bankingDetail?: LedgerBankingDetail) {
    return this.formBuilder.group({
      accountNumber: [bankingDetail ? bankingDetail.accountNumber : '', Validators.required],
      accountType: [bankingDetail ? bankingDetail.accountType : '', Validators.required],
      branchCode: [bankingDetail ? bankingDetail.branchCode : '', Validators.required],
      accountHolderSurname: [bankingDetail ? bankingDetail.accountHolderSurname : '', Validators.required],
      idNumber: [bankingDetail ? bankingDetail.idNumber : '', Validators.required]
    });
  }

  addBankingDetail(bankingDetail?: LedgerBankingDetail) {
    this.bankingDetail.push(this.createBankingDetail(bankingDetail));
    this.cdr.detectChanges();
  }

  deleteBankingDetail(splitIndex: number) {
    this.bankingDetail.removeAt(splitIndex);
  }

  onLoadLookups(): void {
  }

  populateModel(): void {
    this.model.bankingDetailList = this.bankingDetail.controls.map((formItem, index) => {
      const newSplit = new LedgerBankingDetail()
      newSplit.accountNumber = formItem['controls']['accountNumber'].value;
      newSplit.accountType = formItem['controls']['accountType'].value;
      newSplit.branchCode = formItem['controls']['branchCode'].value;
      newSplit.accountHolderSurname = formItem['controls']['accountHolderSurname'].value;
      return newSplit;
    })
  }

  populateForm(): void {
    this.canEdit = !this.isReadonly;
    if (this.model && this.model.bankingDetailList && this.bankingDetail) {
      let data = this.mapTableData(this.model.bankingDetailList)
      this.setDataSource(data);
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  onSelect(index, action) {
    switch (action) {
      case 'view':
        // TODO: View
        break;
      case 'edit':
        // TODO: edit
        // start a new Wizard
        break;
      case 'delete':
        this.deleteBankingDetail(index);
        break;
      default:
        break;
    }
  }
}

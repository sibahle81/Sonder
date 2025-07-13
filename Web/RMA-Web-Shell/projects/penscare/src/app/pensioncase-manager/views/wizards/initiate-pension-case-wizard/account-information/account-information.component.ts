import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { BankBranch } from 'projects/shared-models-lib/src/lib/lookup/bank-branch';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { IntegrationService } from 'projects/shared-services-lib/src/lib/services/integrations.service';

class ComponentData {
  public form: UntypedFormGroup;
  public banks: Lookup[];
  public bankAccountTypes: Lookup[];
  public branches: BankBranch[] = [];
}
@Component({
  selector: 'app-account-information',
  templateUrl: './account-information.component.html',
  styleUrls: ['./account-information.component.css']
})
export class AccountInformationComponent implements OnInit {
  @Input() componentData: ComponentData;
  @Output() saveBankingDetail = new EventEmitter<UntypedFormGroup>();
  @Output() cancelForm = new EventEmitter();
  accountValidationErrorMsg = '';

  recipientsAccountInformationList: Person[] = [];
  form: UntypedFormGroup;
  model: any;
  filteredBranches: BankBranch[] = [];
  isLoading = false;

  constructor(
    private readonly integrationService: IntegrationService,
    private readonly alertService: AlertService
  ){}

  ngOnInit() {
    this.form = this.componentData.form;
    this.loadBranches();
  }

  loadBranchCode () {
    const branchId = this.form.value.bankBranchId;
    const branchData = this.componentData.branches.filter(b => b.id === branchId);
    if (branchData.length > 0) {
      const branchCode = branchData[0].code;
      this.form.controls.branchCode.setValue(branchCode);
    }
  }

  save() {

    this.verifyBankAccount()
  }

  removeNonIntegers(event: any) {
    if (event.target.value.match(/^[0-9]\d*(\.\d+)?$/g) === null) {
      event.target.value = event.target.value.substring(0, event.target.value.length - 1)
    }
  }

  verifyBankAccount(): void {
    this.accountValidationErrorMsg = '';

    const accountNumber = this.form.controls['accountNumber'].value;
    const accountType = this.form.controls['accountType'].value;
    const branchCode = this.form.controls['branchCode'].value;
    const initials = this.form.controls['accountHolderName'].value.substring(0, 1);
    const accountHolderSurname = this.form.controls['accountHolder'].value;
    const idNumber = this.form.controls['idNumber'].value;

    // add the load snippet here
    this.isLoading = true;
    this.integrationService.verifyBankAccount(accountNumber,
      accountType, branchCode, initials,
      accountHolderSurname, idNumber)
      .subscribe(data => {
        this.isLoading = false;
        if (data.success) {
          this.accountValidationErrorMsg = '';
          this.alertService.success('Account has been verified');
          this.saveBankingDetail.emit(this.form)
        } else {
          this.accountValidationErrorMsg = data.errmsg;
          this.alertService.error(this.accountValidationErrorMsg);
        }
      }
    );
  }

  cancel() {
    this.cancelForm.emit();
  }

  loadBranches() {
    const bankId = this.form.value.bankId;
    this.filteredBranches = this.componentData.branches.filter(b => b.bankId === bankId);
  }
}

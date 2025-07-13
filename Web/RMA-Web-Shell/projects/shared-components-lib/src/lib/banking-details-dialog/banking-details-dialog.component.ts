import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { BankBranchService } from 'projects/shared-services-lib/src/lib/services/lookup/bank-branch.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BankService } from 'projects/shared-services-lib/src/lib/services/lookup/bank.service';
import { BankBranch } from 'projects/shared-models-lib/src/lib/lookup/bank-branch';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { Bank } from 'projects/shared-models-lib/src/lib/lookup/bank';

@Component({
  selector: 'app-banking-details-dialog',
  templateUrl: './banking-details-dialog.component.html',
  styleUrls: ['./banking-details-dialog.component.css']
})
export class BankingDetailsDialogComponent implements OnInit {

  title: string = 'Bank Account';
  form: UntypedFormGroup;

  banks: Bank[] = [];
  bankBranches: BankBranch[] = [];
  bankAccountTypes: Lookup[] = [];
  bankAccount: RolePlayerBankingDetail;
  
  loadingBanks: boolean = false;
  loadingBranches: boolean = false;
  loadingAccountTypes: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<BankingDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly alertService: AlertService,
    private readonly bankService: BankService,
    private readonly branchService: BankBranchService,
    private readonly lookupService: LookupService
  ) {
    this.bankAccount = data;
  }

  ngOnInit() {
    this.loadBanks();
    this.loadBankAccountTypes();
    this.createForm();
    this.populateForm();
  }

  loadBanks() {
    this.loadingBanks = true;
    this.bankService.getBanks().subscribe({
      next: (data: Bank[]) => {
        this.banks = data;
      },
      error: (response: HttpErrorResponse) => {
        const errorMessage = response.error.Error ? response.error.Error : response.message;
        this.alertService.error(errorMessage, 'Bank Error');
        this.loadingBanks = false;
      },
      complete: () => {
        this.loadingBanks = false;
      }
    });
  }

  loadBankBranches(bankId: number, clearBranchCode: boolean) {
    this.loadingBranches = true;
    if (clearBranchCode) {
      this.form.patchValue({ branchCode: null });
    }
    this.branchService.getBranchesByBank(bankId).subscribe({
      next: (data: BankBranch[]) => {
        this.bankBranches = data;
      },
      error: (response: HttpErrorResponse) => {
        const errorMessage = response.error.Error ? response.error.Error : response.message;
        this.alertService.error(errorMessage, 'Bank Branch Error');
        this.loadingBranches = false;
      },
      complete: () => {
        this.loadingBranches = false;
      }
    });
  }
  
  loadBankAccountTypes() {
    this.loadingAccountTypes = true;
    this.lookupService.getBankAccountTypes().subscribe({
      next: (data: Lookup[]) => {
        this.bankAccountTypes = data;
      },
      error: (response: HttpErrorResponse) => {
        const errorMessage = response.error.Error ? response.error.Error : response.message;
        this.alertService.error(errorMessage, 'Bank Account Type Error');
        this.loadingAccountTypes = false;
      },
      complete: () => {
        this.loadingAccountTypes = false;
      }
    });
  }

  createForm() {
    this.form = this.formBuilder.group({
      bankId: ['', [Validators.required, Validators.min(1)]],
      bankBranchId: ['', [Validators.required, Validators.min(1)]],
      branchCode: ['', [Validators.required]],
      bankAccountType: ['', [Validators.required, Validators.min(1)]],
      accountNumber: ['', [Validators.required]]
    });
    this.form.markAllAsTouched();
  }

  populateForm() {
    this.form.patchValue({
      bankId: this.bankAccount.bankId,
      bankBranchId: this.bankAccount.bankBranchId,
      branchCode: this.bankAccount.branchCode,
      bankAccountType: this.bankAccount.bankAccountType,
      accountNumber: this.bankAccount.accountNumber
    });
    if (this.bankAccount.bankId && this.bankAccount.bankId > 0) {
      this.loadBankBranches(this.bankAccount.bankId, false);
    }
  }

  loadBranchCode(branchId: number) {
    const branch = this.bankBranches.find(s => s.id === branchId);
    if (branch) {
      this.form.patchValue({branchCode: branch.code});
    } else {
      this.form.patchValue({branchCode: null});
    }
  }

  validateBankAccount(): void {
    if (this.form.valid) {
      var values = this.form.getRawValue();
      this.bankAccount.bankId = values.bankId;
      this.bankAccount.bankBranchId = values.bankBranchId;
      this.bankAccount.branchCode = values.branchCode;
      this.bankAccount.bankAccountType = values.bankAccountType;
      this.bankAccount.accountNumber = values.accountNumber;
      this.dialogRef.close(this.bankAccount);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

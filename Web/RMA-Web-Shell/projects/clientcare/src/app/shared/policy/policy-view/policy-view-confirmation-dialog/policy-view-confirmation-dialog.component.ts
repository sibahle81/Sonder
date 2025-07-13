import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { CaseTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/case-type.enum';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { BehaviorSubject } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'policy-view-confirmation-dialog',
  templateUrl: './policy-view-confirmation-dialog.component.html',
  styleUrls: ['./policy-view-confirmation-dialog.component.css']
})
export class PolicyViewConfirmationDialogComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  form: UntypedFormGroup;
  dependentPolicies: Policy[];
  isCoid: boolean;

  cancellation = CaseTypeEnum.CancelPolicy;
  reinstatement = CaseTypeEnum.ReinstatePolicy;
  maintain = CaseTypeEnum.MaintainPolicyChanges;

  constructor(
    public dialogRef: MatDialogRef<PolicyViewConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.createForm();
    this.isCoid = this.data.policy.productCategoryType == ProductCategoryTypeEnum.Coid;
    this.isLoading$.next(false);
  }

  createForm() {
    this.form = this.formBuilder.group({
      reason: [{ value: null, disabled: false }, [Validators.required]],
    });
  }

  readForm(): string[] {
    return this.form.controls.reason.value;
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

  save(): void {
    const reasonText = this.readForm();
    this.dialogRef.close(reasonText);
  }

  close(): void {
    this.dialogRef.close(null);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}

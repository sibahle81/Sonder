import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClaimEstimate } from '../../../../entities/personEvent/claimEstimate';
import { ClaimInvoiceService } from 'projects/claimcare/src/app/claim-manager/services/claim-invoice.service';
import { BehaviorSubject } from 'rxjs';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';

@Component({
  templateUrl: './estimated-manual-capture-dialog.component.html',
  styleUrls: ['./estimated-manual-capture-dialog.component.css']
})
export class EstimatedManualCaptureDialogComponent {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  form: UntypedFormGroup;

  claimEstimate: ClaimEstimate;

  allRequiredDocumentsUploaded: boolean;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimInvoiceService: ClaimInvoiceService,
    public dialogRef: MatDialogRef<EstimatedManualCaptureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.claimEstimate = data.claimEstimate ? data.claimEstimate : this.claimEstimate;
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      amount: [{ value: null, disabled: false }, Validators.required],
    });

    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      amount: this.claimEstimate.estimatedValue ? this.claimEstimate.estimatedValue : 0,
    });

    this.isLoading$.next(false);
  }

  readForm() {
    this.claimEstimate.estimatedValue = +this.form.controls.amount.value;
  }

  save() {
    this.isLoading$.next(true);
    this.readForm();
    if (!this.claimEstimate.claimEstimateId || this.claimEstimate.claimEstimateId <= 0) {
      this.claimInvoiceService.AddClaimEstimate(this.claimEstimate).subscribe(result => {
        this.claimEstimate = result;
        this.close();
      });
    } else {
      this.claimInvoiceService.updateClaimEstimate(this.claimEstimate).subscribe(result => {
        this.close();
      });
    }
  }

  close() {
    this.dialogRef.close(this.claimEstimate);
  }

  getEstimateType(id: number) {
    return this.formatText(EstimateTypeEnum[id]);
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : '-';
  }

  isRequiredDocumentsUploaded(isUploaded: boolean) {
    this.allRequiredDocumentsUploaded = isUploaded;
  }
}

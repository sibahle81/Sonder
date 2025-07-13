import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClaimEstimate } from '../../../../entities/personEvent/claimEstimate';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';

@Component({
  templateUrl: './estimated-override-dialog.component.html',
  styleUrls: ['./estimated-override-dialog.component.css']
})
export class EstimatedOverrideDialogComponent {

  form: UntypedFormGroup;

  claimEstimates: ClaimEstimate[];

  note = 'Estimates manually edited. ';

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<EstimatedOverrideDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.claimEstimates = data.claimEstimates ? data.claimEstimates : this.claimEstimates;
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      estimatedPd: [{ value: null, disabled: !(this.claimEstimates?.some(s => s.estimateType == EstimateTypeEnum.PDPension || s.estimateType == EstimateTypeEnum.PDLumpSum)) }, [Validators.min(0), Validators.max(100)]],
      estimatedTtd: [{ value: null, disabled: !(this.claimEstimates?.some(s => s.estimateType == EstimateTypeEnum.TTD || s.estimateType == EstimateTypeEnum.ShiftLoss || s.estimateType == EstimateTypeEnum.TPD)) }]
    });

    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      estimatedPd: this.claimEstimates?.find(s => s.estimatePd && s.estimatePd > 0)?.estimatePd,
      estimatedTtd: this.claimEstimates?.find(s => s.estimatedDaysOff && s.estimatedDaysOff > 0)?.estimatedDaysOff
    });
  }

  readForm() {
    this.claimEstimates.forEach(claimEstimate => {
      if (claimEstimate.estimateType == EstimateTypeEnum.PDPension || claimEstimate.estimateType == EstimateTypeEnum.PDLumpSum) {
        const newEstimatePd = this.form.controls.estimatedPd.value;
        if (claimEstimate.estimatePd !== newEstimatePd) {
          this.note += `:PD% (${claimEstimate.estimatePd}%) to (${newEstimatePd}%)`;
          claimEstimate.estimatePd = newEstimatePd;
        }
      }

      if (claimEstimate.estimateType == EstimateTypeEnum.TTD || claimEstimate.estimateType == EstimateTypeEnum.ShiftLoss || claimEstimate.estimateType == EstimateTypeEnum.TPD) {
        const newEstimateDaysOff = this.form.controls.estimatedTtd.value;
        if (claimEstimate.estimatedDaysOff !== newEstimateDaysOff) {
          this.note += `:TTD (${claimEstimate.estimatedDaysOff}) to (${newEstimateDaysOff})`;
          claimEstimate.estimatedDaysOff = newEstimateDaysOff;
        }
      }
    });
  }

  save() {
    this.readForm();
    this.dialogRef.close({
      claimEstimates: this.claimEstimates,
      note: this.note
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}

import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';

@Component({
  templateUrl: './liability-decision-dialog.component.html',
  styleUrls: ['./liability-decision-dialog.component.css']
})
export class LiabilityDecisionDialogComponent {

  form: UntypedFormGroup;

  claimLiabilityStatuses: ClaimLiabilityStatusEnum[];
  selectedLiabilityStatus: ClaimLiabilityStatusEnum;

  moduleType = [ModuleTypeEnum.ClaimCare];
  noteItemType = NoteItemTypeEnum.PersonEvent;
  noteCaptured: boolean;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<LiabilityDecisionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.claimLiabilityStatuses = data.claimLiabilityStatuses ? data.claimLiabilityStatuses : this.ToArray(ClaimLiabilityStatusEnum);
    this.createForm();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      claimLiabilityStatus: [{ value: null, disabled: false }]
    });
  }

  readForm() {
    this.selectedLiabilityStatus = this.form.controls.claimLiabilityStatus.value;
  }

  save() {
    this.dialogRef.close(this.selectedLiabilityStatus);
  }

  cancel() {
    this.dialogRef.close();
  }

  setNoteCaptured($event: boolean) {
    this.noteCaptured = $event;
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  getClaimLiabilityStatus(claimLiabilityStatus: ClaimLiabilityStatusEnum): string {
    return this.formatText(ClaimLiabilityStatusEnum[claimLiabilityStatus]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}

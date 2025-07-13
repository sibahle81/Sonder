import { Component, Inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { Claim } from '../../../../entities/funeral/claim.model';

@Component({
  selector: 'app-recommend-caa-dialog',
  templateUrl: './recommend-caa-dialog.component.html',
  styleUrls: ['./recommend-caa-dialog.component.css']
})
export class RecommendCaaDialogComponent implements OnInit, OnChanges{

  isReadOnly = true;
  form: UntypedFormGroup;
  claim: Claim;
  disabilityPercent: number;
  
  constructor(
    public dialogRef: MatDialogRef<RecommendCaaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: UntypedFormBuilder,
  ) {
    
  }

  ngOnInit() {
    this.createForm();
    this.claim = new Claim();
    this.claim = this.data.claim;
    this.disabilityPercent = this.data.claim.disabilityPercentage;
  }

  ngOnChanges(changes: SimpleChanges): void {
    
  }
  
  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      caa: [{ value: '', disabled: false }],
      fa: [{ value: '', disabled: false }]
    });
  }

  submit() {
    const formDetails = this.form.getRawValue();
    this.claim.caa = formDetails.caa;
    this.claim.familyAllowance = formDetails.fa;

    this.dialogRef.close(this.claim);
  }
  
  cancel() {
    this.dialogRef.close(null);
  }
}
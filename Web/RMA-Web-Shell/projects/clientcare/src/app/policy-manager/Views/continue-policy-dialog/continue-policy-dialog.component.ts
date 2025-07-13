import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReinstatePolicyDialogComponent } from '../reinstate-policy-dialog/reinstate-policy-dialog.component';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
  selector: 'app-continue-policy-dialog',
  templateUrl: './continue-policy-dialog.component.html',
  styleUrls: ['./continue-policy-dialog.component.css']
})
export class ContinuePolicyDialogComponent implements OnInit {

  effectiveDateform: UntypedFormGroup;
  canAddEdit = false;
  rolePlayerPolicy: RolePlayerPolicy;
  effectiveDate: Date;

  constructor(
    public dialogRef: MatDialogRef<ContinuePolicyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService
  ) {
    this.rolePlayerPolicy = data.rolePlayerPolicy;
    this.canAddEdit = data.canAddEdit;
  }

  ngOnInit() {
    this.createForm();   
  }

  createForm() {
    this.effectiveDateform = this.formBuilder.group({     
      effectiveDate: [null, [Validators.required]]
    });
  }

  isFirstDay = (d: Date): boolean => {
    const date = new Date(d).getDate();
    const val = date / 1 === 1;
    return val;
  }

  saveEffectiveDate() {
    if (this.effectiveDateform.valid) {
      const effectiveContinuationDate = this.getFormattedDate(this.effectiveDateform.get('effectiveDate').value);
      this.dialogRef.close(effectiveContinuationDate);
    }
  }

  getFormattedDate(dt: Date): Date {
    if (!dt) { return; }
    const dtm = new Date(dt);
    const month = `${dtm.getMonth() + 1}`.padStart(2, '0');
    const date = `${dtm.getDate()}`.padStart(2, '0');
    return new Date(`${dtm.getFullYear()}-${month}-${date}`);
  } 
  
  closeDialog(): void {
    this.dialogRef.close();
  }
}

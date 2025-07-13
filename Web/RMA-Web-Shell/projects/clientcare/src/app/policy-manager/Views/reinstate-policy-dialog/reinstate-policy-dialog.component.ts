import { Component, OnInit, Inject } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';

@Component({
  selector: 'app-reinstate-policy-dialog',
  templateUrl: './reinstate-policy-dialog.component.html',
  styleUrls: ['./reinstate-policy-dialog.component.css'],
  providers: [{ provide: DateAdapter, useClass: MatDatePickerDateFormat }, { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }]
})
export class ReinstatePolicyDialogComponent implements OnInit {

  form: UntypedFormGroup;
  canAddEdit = false;
  rolePlayerPolicy: RolePlayerPolicy;
  reason: string;
  effectiveDate: Date;
  loadingReasons = true;
  minDate = new Date();

  constructor(
    public dialogRef: MatDialogRef<ReinstatePolicyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: UntypedFormBuilder

  ) {
    this.rolePlayerPolicy = data.rolePlayerPolicy;
    this.canAddEdit = data.canAddEdit;
    this.minDate = this.rolePlayerPolicy.lastLapsedDate
      ? this.rolePlayerPolicy.lastLapsedDate
      : this.rolePlayerPolicy.policyInceptionDate;
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      effectiveDate: [null, [Validators.required]]
    });
  }

  isFirstDay = (d: Date): boolean => {
    const date = new Date(d).getDate();
    const val = date / 1 === 1;
    return val;
  }

  saveEffectiveDate() {
    if (this.form.valid) {
      const effectiveReinstateDate = this.getFormattedDate(this.form.get('effectiveDate').value);
      this.dialogRef.close(effectiveReinstateDate);
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

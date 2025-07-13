import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'src/app/shared-utilities/datepicker/dateformat';
import { RolePlayerPolicy } from 'src/app/shared/models/role-player-policy';
import { LookupService } from 'src/app/shared/services/lookup.service';

@Component({
  selector: 'app-reinstate-policy-dialog',
  templateUrl: './reinstate-policy-dialog.component.html',
  styleUrls: ['./reinstate-policy-dialog.component.css'],
  providers: [{ provide: DateAdapter, useClass: MatDatePickerDateFormat }, { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }]
})
export class ReinstatePolicyDialogComponent implements OnInit {

  form: FormGroup;
  canAddEdit = false;
  rolePlayerPolicy: RolePlayerPolicy;
  reason: string;
  effectiveDate: Date;
  loadingReasons = true;
  minDate = new Date();

  constructor(
    public dialogRef: MatDialogRef<ReinstatePolicyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService,

  ) {
    this.rolePlayerPolicy = data.rolePlayerPolicy;
    this.canAddEdit = data.canAddEdit;
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

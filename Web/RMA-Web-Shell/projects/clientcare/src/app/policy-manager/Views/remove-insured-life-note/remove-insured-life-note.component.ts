import { DatePipe } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

import { PolicyManageReason } from '../../shared/entities/policy-manage-reason';
import { RolePlayer } from '../../shared/entities/roleplayer';

@Component({
  selector: 'app-remove-insured-life-note',
  templateUrl: './remove-insured-life-note.component.html',
  styleUrls: ['./remove-insured-life-note.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class RemoveInsuredLifeNoteComponent implements OnInit {

  form: UntypedFormGroup;
  canAddEdit = false;
  rolePlayer: RolePlayer;
  reason: string;
  effectiveDate: Date;
  reasons: Lookup[];
  loadingReasons = true;
  minEffectiveDate: Date;

  constructor(
    public dialogRef: MatDialogRef<RemoveInsuredLifeNoteComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly datePipe: DatePipe,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService
  ) {
    this.rolePlayer = data.rolePlayer;
    this.canAddEdit = data.canAddEdit;
    this.minEffectiveDate = data.minEffectiveDate ? new Date(data.minEffectiveDate) : new Date();
  }

  ngOnInit() {
    this.createForm();
    this.loadLookUps();
  }

  createForm() {
    this.form = this.formBuilder.group({
      reason: ['', [Validators.required]],
      effectiveDate: [null, [Validators.required]]
    });
  }

  loadLookUps() {
    this.lookupService.getInsuredLifeRemovalReasons().subscribe(data => {
      this.reasons = data;
      this.loadingReasons = false;
    });
  }

  isLastDay = (d: Date): boolean => {
    const y = new Date(d).getFullYear();
    const m = new Date(d).getMonth();
    const lastDay = new Date(y, m + 1, 0);
    const date = new Date(d).getDate();
    const val = date / (lastDay.getDate()) === 1;
    return val;
  }

  saveRemovalReason() {
    if (this.form.valid) {
      this.dialogRef.close(new PolicyManageReason(this.form.get('effectiveDate').value, this.form.get('reason').value)
      );
    }
  }

  getDateFormattedDate(dt: Date): string {
    if (!dt) { return ''; }
    const dtm = new Date(dt);
    const month = `${dtm.getMonth() + 1}`.padStart(2, '0');
    const date = `${dtm.getDate()}`.padStart(2, '0');
    return `${dtm.getFullYear()}-${month}-${date}`;
  }

  setSelectedReason(event: any) {
    this.reason = this.reasons.find(c => c.id === event.value).name;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  validateDates(): void {
    this.form.get('effectiveDate').setErrors(null);

    if (!this.form.get('effectiveDate').value) {
      this.form.get('effectiveDate').markAsTouched();
      this.form.get('effectiveDate').setErrors({ required: true });
      return;
    }

    const effectiveDate = new Date(this.form.get('effectiveDate').value);
    effectiveDate.setHours(0, 0, 0, 0);

    if (effectiveDate.getTime() < this.minEffectiveDate.getTime()) {
      this.form.get('effectiveDate').setErrors({ effectiveDateInThePast: true });
    }
  }

  getMinEffectiveDate(): string {
    return this.datePipe.transform(this.minEffectiveDate, "yyyy/MM/dd");
  }
}

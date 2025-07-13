import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { PolicyManageReason } from 'src/app/shared/models/policy-manage-reason';
import { RolePlayer } from 'src/app/shared/models/roleplayer';
import { LookupService } from 'src/app/shared/services/lookup.service';

@Component({
  selector: 'app-remove-insured-life-note',
  templateUrl: './remove-insured-life-note.component.html',
  styleUrls: ['./remove-insured-life-note.component.css']
})
export class RemoveInsuredLifeNoteComponent implements OnInit {

  form: FormGroup;
  canAddEdit = false;
  rolePlayer: RolePlayer;
  reason: string;
  effectiveDate: Date;
  reasons: Lookup[];
  loadingReasons = true;
  constructor(
    public dialogRef: MatDialogRef<RemoveInsuredLifeNoteComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,

    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService
  ) {
    this.rolePlayer = data.rolePlayer;
    this.canAddEdit = data.canAddEdit;
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
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);

    const today = new Date(dtm).getTime();

    if (effectiveDate.getTime() < today) {
      this.form.get('effectiveDate').setErrors({ effectiveDateInThePast: true });
    }
  }
}

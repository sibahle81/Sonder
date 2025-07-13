import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { PolicyManageReason } from 'src/app/shared/models/policy-manage-reason';
import { RolePlayerPolicy } from 'src/app/shared/models/role-player-policy';
import { LookupService } from 'src/app/shared/services/lookup.service';

@Component({
  selector: 'app-cancel-policy-reason-dialog',
  templateUrl: './cancel-policy-reason-dialog.component.html',
  styleUrls: ['./cancel-policy-reason-dialog.component.css']
})

export class CancelPolicyReasonDialogComponent implements OnInit {

  form: FormGroup;
  canAddEdit = false;
  rolePlayerPolicy: RolePlayerPolicy;
  reason: string;
  effectiveDate: Date;
  reasons: Lookup[];
  loadingReasons = true;

  constructor(
    public dialogRef: MatDialogRef<CancelPolicyReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService
  ) {
    this.rolePlayerPolicy = data.rolePlayerPolicy;
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
    this.lookupService.getPolicyCancelReasons().subscribe(data => {
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
      const effectiveCancellationDate = this.getFormattedDate(this.form.get('effectiveDate').value);
      this.dialogRef.close(new PolicyManageReason(effectiveCancellationDate, this.form.get('reason').value));
    }
  }

  getFormattedDate(dt: Date): Date {
    if (!dt) { return; }
    const dtm = new Date(dt);
    const month = `${dtm.getMonth() + 1}`.padStart(2, '0');
    const date = `${dtm.getDate()}`.padStart(2, '0');
    return new Date(`${dtm.getFullYear()}-${month}-${date}`);
  }

  setSelectedReason(event: any) {
    this.reason = this.reasons.find(c => c.id === event.value).name;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

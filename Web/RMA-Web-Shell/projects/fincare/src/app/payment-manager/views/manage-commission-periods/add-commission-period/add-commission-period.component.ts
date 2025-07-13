import { Component, Inject, OnInit } from '@angular/core';
import { CommissionPeriod } from '../../../models/commission-period';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommissionService } from '../../../services/commission.service';
import { UntypedFormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';

@Component({
  selector: 'app-add-commission-period',
  templateUrl: './add-commission-period.component.html',
  styleUrls: ['./add-commission-period.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class AddCommissionPeriodComponent implements OnInit {
  commissionPeriods: CommissionPeriod[];
  constructor(public dialogRef: MatDialogRef<AddCommissionPeriodComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CommissionPeriod,
              public commissionService: CommissionService) { }

  formControl = new UntypedFormControl('', [
    Validators.required
  ]);

  ngOnInit() {
  }

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' :
        '';
  }

  submit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public confirmAdd(): void {
    this.commissionService.addCommissionPeriod(this.data);
  }
}


import { Component, OnInit, Inject } from '@angular/core';
import { CommissionPeriod } from '../../../models/commission-period';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommissionService } from '../../../services/commission.service';
import { UntypedFormControl, Validators } from '@angular/forms';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';

@Component({
  selector: 'app-edit-commission-period',
  templateUrl: './edit-commission-period.component.html',
  styleUrls: ['./edit-commission-period.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class EditCommissionPeriodComponent implements OnInit {
  commissionPeriod: CommissionPeriod;
  periodChangeReasons: Lookup[] = [];
  constructor(public dialogRef: MatDialogRef<EditCommissionPeriodComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CommissionPeriod,
              private readonly lookupService: LookupService,
              public commissionService: CommissionService) { }

  formControl = new UntypedFormControl('', [
    Validators.required
  ]);

  ngOnInit() {
    this.commissionPeriod = this.data;
    this.loadLookUps();
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

  loadLookUps() {
    this.lookupService.getPeriodChangeReasons().subscribe(data => {
      this.periodChangeReasons = data;
    });
  }

  periodChangeReasonChange($event: any) {
    this.commissionPeriod.periodChangeReasonId = $event.value;
  }

  public confirmEdit(): void {
    this.commissionService.editCommissionPeriod(this.data);
  }
}


import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import 'src/app/shared/extensions/date.extensions';

import { BulkProcessPoliciesComponent } from '../bulk-process-policies/bulk-process-policies.component';
import { PolicyProcessService } from '../../shared/Services/policy-process.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

@Component({
  templateUrl: './bulk-cancel-policies.component.html',
  styleUrls: ['./bulk-cancel-policies.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class BulkCancelPoliciesComponent extends BulkProcessPoliciesComponent implements OnInit {

  form: UntypedFormGroup;
  loadingReasons = false;
  cancellationReasons: Lookup[] = [];

  constructor(
    datePipe: DatePipe,
    alertService: AlertService,
    private readonly policyProcessService: PolicyProcessService,
    private readonly lookupService: LookupService,
    private readonly formBuilder: UntypedFormBuilder
  ) {
    super(alertService, datePipe);
    this.title = 'Bulk Cancel Policies';
  }

  ngOnInit(): void {
    this.loadCancellationReasons();
    this.createForm();
  }

  loadCancellationReasons(): void {
    this.loadingReasons = true;
    this.lookupService.getPolicyCancelReasons().subscribe({
      next: (data: Lookup[]) => {
        this.cancellationReasons = data;
      },
      error: (response: HttpErrorResponse) => {
        if (response.error && response.error.Error) {
          this.alertService.error(response.error.Error, 'Cancellation Reasons');
        } else if (response.message) {
          this.alertService.error(response.message, 'Cancellation Reasons');
        } else {
          this.alertService.error('Could not load cancellation reasons', 'Cancellation Reasons');
        }
      },
      complete: () => {
        this.loadingReasons = false;
      }
    });
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      cancellationReason: [null, [Validators.required, Validators.min(1)]],
      cancellationDate: [new Date(), [Validators.required]]
    });
  }

  processPolicies(): void {

    if (!this.form.get('cancellationReason').valid) {
      this.form.get('cancellationReason').markAsTouched();
      this.uploadControlComponent.resetUpload();
      return;
    }
    if (!this.form.get('cancellationDate').valid) {
      this.form.get('cancellationDate').markAsTouched();
      this.uploadControlComponent.resetUpload();
      return;
    }

    const lines = this.loadPolicyFileContent();
    if (lines.length === 0) {
      this.uploadControlComponent.isUploading = false;
      return;
    }

    const values = this.form.getRawValue();
    const cancellationDate = this.datePipe.transform(values.cancellationDate, 'yyyy-MM-dd');
    const cancellationReason = values.cancellationReason;

    const policyCount = lines.length;
    this.message.next(`Cancelling ${policyCount} ${policyCount > 1 ? 'policies' : 'policy'}...`);
    let policies = 0;

    for (const policy of lines) {
      this.policyProcessService.cancelPolicy(policy, cancellationDate, cancellationReason).subscribe({
        next: (data) => { },
        error: (error: HttpErrorResponse) => {
          if (error.error && error.error.Error) {
            this.errors.push(error.error.Error);
          } else if (error.message) {
            this.errors.push(`Policy ${policy} - ${error.message}`);
          } else {
            this.errors.push(`Undefined error for policy ${policy}`);
          }
        }
      })
        .add(() => {
          policies++;
          this.message.next(`Policy ${policies} of ${policyCount} completed.`);
          if (policies >= policyCount) {
            this.uploadControlComponent.isUploading = false;
            if (this.errors.length > 0) {
              this.alertService.error('Policy cancellation completed with errors.');
            } else {
              this.uploadControlComponent.resetUpload();
              this.uploadControlComponent.clearUploadedDocs();
              this.alertService.success('Policy cancellation completed.');
            }
          }
        });
    }
  }

  loadPolicyFileContent(): any[] {
    const result = [];
    if (this.policies.length === 0) { return result; }
    for (const line of this.policies) {
      if (!String.isNullOrEmpty(line)) {
        result.push(line);
      }
    }
    return result;
  }

  isLastDay = (d: Date): boolean => {
    if (!d) { return false; }
    const y = new Date(d).getFullYear();
    const m = new Date(d).getMonth();
    const lastDay = new Date(y, m + 1, 0);
    const date = new Date(d).getDate();
    const val = date / (lastDay.getDate()) === 1;
    return val;
  }
}

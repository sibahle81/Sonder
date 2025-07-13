import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';

import 'src/app/shared/extensions/date.extensions';

import { BulkProcessPoliciesComponent } from '../bulk-process-policies/bulk-process-policies.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PolicyProcessService } from '../../shared/Services/policy-process.service';

@Component({
  templateUrl: '../bulk-process-policies/bulk-process-policies.component.html',
  styleUrls: ['../bulk-process-policies/bulk-process-policies.component.css']
})
export class BulkLapsePoliciesComponent extends BulkProcessPoliciesComponent {

  constructor(
    datePipe: DatePipe,
    alertService: AlertService,
    private readonly policyProcessService: PolicyProcessService
  ) {
    super(alertService, datePipe);
    this.title = 'Bulk Lapse Policies';
  }

  processPolicies(): void {
    const lines = this.loadPolicyFileContent();
    if (lines.length === 0) {
      this.uploadControlComponent.isUploading = false;
      return;
    }
    const policyCount = lines.length;
    this.message.next(`Lapsing ${policyCount} ${policyCount > 1 ? 'policies' : 'policy'}...`);
    let policies = 0;
    for (const policy of lines) {
      this.policyProcessService.lapsePolicy(policy[0], this.datePipe.transform(policy[1], 'yyyy-MM-dd')).subscribe({
        next: (data) => { },
        error: (error: HttpErrorResponse) => {
          if (error.error) {
            if (error.error.Error) {
              this.errors.push(error.error.Error);
            } else if (error.message) {
              this.errors.push(error.message);
            }
          } else {
            this.errors.push(`Undefined error for policy ${policy[0]}`);
          }
        }
      })
        .add(() => {
          policies++;
          this.message.next(`Policy ${policies} of ${policyCount} completed.`);
          if (policies >= policyCount) {
            this.uploadControlComponent.isUploading = false;
            if (this.errors.length > 0) {
              this.alertService.error('Policy lapsing completed with errors.');
            } else {
              this.uploadControlComponent.resetUpload();
              this.uploadControlComponent.clearUploadedDocs();
              this.alertService.success('Policy lapsing completed.');
            }
          }
        });
    }
  }
}

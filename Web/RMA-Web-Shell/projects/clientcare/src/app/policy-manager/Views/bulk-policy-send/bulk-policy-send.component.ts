import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ValidateEmail } from 'projects/shared-utilities-lib/src/lib/validators/email.validator';
import { BulkPolicySendService } from './bulk-policy-send.service';
import { Policy } from '../../shared/entities/policy';

@Component({
  selector: 'app-bulk-policy-send',
  templateUrl: './bulk-policy-send.component.html',
  styleUrls: ['./bulk-policy-send.component.css']
})
export class BulkPolicySendComponent implements OnInit {

  form: UntypedFormGroup;
  policyId: number;
  recipients: number;
  loadingPolicyNumber = false;

  constructor(
    private readonly alertService: AlertService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly policyService: BulkPolicySendService
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      policyNumber: ['', [Validators.required]],
      schemeName: ['', [Validators.required]],
      recipient: ['', [Validators.required, ValidateEmail]],
      recipient1: ['', [ValidateEmail]],
      recipient2: ['', [ValidateEmail]],
      recipient3: ['', [ValidateEmail]]
    });
    this.recipients = 1;
  }

  findPolicyKeyup(event: any): void {
    if (event.keyCode === 13) {
      this.findPolicy();
    }
  }

  findPolicyBlur(event: any): void {
    this.findPolicy();
  }

  findPolicy(): void {
    const policyNumber = this.form.get('policyNumber').value;

    if (policyNumber.length < 5) { return; }

    this.form.patchValue({ schemeName: '' });
    this.loadingPolicyNumber = true;
    this.policyService.getPolicy(policyNumber).subscribe({
      next: (data: Policy) => {
        this.policyId = data.policyId;
        this.form.patchValue({ schemeName: data.clientName });
      },        
      error: (response: HttpErrorResponse) => {
        const msg = (response.error && response.error.Error) ? response.error.Error : response.message;
        this.alertService.error(msg, 'Policy Error');
        this.loadingPolicyNumber = false;
      },
      complete: () => {
        this.loadingPolicyNumber = false;
      }
    });
  }

  sendPolicySchedules(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid) { return; }
    var recipients = this.getRecipients();
    this.policyService.sendPolicySchedules(this.policyId, recipients).subscribe({
      next: (data: boolean) => {
        this.alertService.success('Schedules have been queued for transmission');
        this.form.patchValue({
          policyNumber: '',
          schemeName: '',
          recipient: '',
          recipient1: '',
          recipient2: '',
          recipient3: ''
        });
        this.form.get('policyNumber').markAsUntouched();
        this.form.get('schemeName').markAsUntouched();
        this.form.get('recipient').markAsUntouched();
        this.form.get('recipient1').markAsUntouched();
        this.form.get('recipient2').markAsUntouched();
        this.form.get('recipient3').markAsUntouched();
      },        
      error: (response: HttpErrorResponse) => {
        const msg = (response.error && response.error.Error) ? response.error.Error : response.message;
        this.alertService.error(msg, 'Transmission Error');
        this.loadingPolicyNumber = false;
      }      
    });
  }

  getRecipients(): string {
    const values = this.form.getRawValue();
    let recipients = values.recipient;
    if (values.recipient1) { recipients += `;${values.recipient1}`; }
    if (values.recipient2) { recipients += `;${values.recipient2}`; }
    if (values.recipient3) { recipients += `;${values.recipient3}`; }
   return recipients;
  }

  addRecipient(): void {
    this.recipients++;
  }

  hideRecipient(idx: number): boolean {
    return this.recipients <= idx;
  }
}

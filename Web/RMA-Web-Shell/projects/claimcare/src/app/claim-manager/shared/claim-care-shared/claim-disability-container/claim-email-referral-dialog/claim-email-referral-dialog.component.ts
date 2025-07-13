import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Claim } from '../../../entities/funeral/claim.model';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { FormArray, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { EmailRequest } from 'projects/shared-services-lib/src/lib/services/email-request/email-request';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { SendEmailService } from 'projects/shared-services-lib/src/lib/services/email-request/send-email.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'claim-email-referral-dialog',
  templateUrl: './claim-email-referral-dialog.component.html',
  styleUrls: ['./claim-email-referral-dialog.component.css']
})
export class ClaimEmailReferralDialogComponent implements OnInit {

  claim: Claim;
  personEvent: PersonEventModel;

  form: UntypedFormGroup;
  private formArray: FormArray = new FormArray([]);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly sendEmailService: SendEmailService,
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    public dialogRef: MatDialogRef<ClaimEmailReferralDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.personEvent = this.data.personEvent;
    this.getClaimDetails();
    this.createForm();
    this.isLoading$.next(false);
  }

  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      recipient: [{ value: '', disabled: false }, [Validators.required, Validators.email, 
                    Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      message: [{ value: '', disabled: false }, Validators.required],
    });

    this.addForm(this.form);
  }

  readForm(): any {
    if (!this.form) { return; }

    const formDetails = this.form.getRawValue();
    return formDetails;
  }

  addForm(formGroup: FormGroup) {
    this.formArray.push(formGroup);
  }

  formValid(): boolean {
    return this.formArray.valid && !this.formArray.pristine;
  }

  getClaimDetails(){
    this.personEvent.claims.forEach((claimdetail, index) => {
      if (index == 0) {
        this.claim = claimdetail;
      }
    });
  }

  sendReferral() {
    if (this.form.invalid) { return; }

    this.isLoading$.next(true);

    let email = this.readForm();
    
    const emailRequest = new EmailRequest();
    emailRequest.itemId = this.claim.personEventId;
    emailRequest.subject = `${this.claim.personEventId} - Referral instruction`;
    emailRequest.fromAddress = this.authService.getUserEmail();
    emailRequest.recipients = email.recipient;
    emailRequest.body = email.message;
    emailRequest.isHtml = false;
    
    this.sendEmailService.sendEmail(emailRequest).subscribe(result => {
      switch (result) {
        case 200:
          this.alertService.success('Email successfully sent.');
          break;
        default:
          this.alertService.error('Email not sent successfully.');
          break;
      }
      this.isLoading$.next(false);
    }, error => {
      this.alertService.error(error);});
    
    this.isLoading$.next(false);
    this.dialogRef.close(emailRequest);
  }

  cancel() {
    this.dialogRef.close(null);
  }

  closeDialog(){
    this.dialogRef.close(true);
  }
}

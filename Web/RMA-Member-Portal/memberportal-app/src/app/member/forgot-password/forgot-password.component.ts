import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AlertService } from 'src/app/shared/services/alert.service';
import { UserRegistrationService } from '../services/user-registration.service';
import { ValidateEmail } from 'src/app/shared-utilities/validators/email.validator';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  form: FormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingSendEmail$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  memberMessage: string;
  isMessageVisible = false;
  isResend: boolean;

  constructor(private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly alertService: AlertService,
    private readonly userRegistrationService: UserRegistrationService) { }

  ngOnInit(): void {
    this.createForm();
    this.isResend = false;
  }

  createForm(): void {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      emailAddress: ['', [Validators.required, ValidateEmail]],
    });
  }

  Submit() {
    this.isLoading$.next(true);
    const emailAddress = this.form.get('emailAddress').value;
    this.userRegistrationService.getUserDetailsByEmail(emailAddress).subscribe((result) => {
      if (result.userId > 0 && result.userExistInActivationTable) {
        this.isLoading$.next(false);
        this.sendPasswordResetLink(emailAddress);
      }
      if (result.userId === 0 && !result.userExistInActivationTable) {
        this.memberMessage = "A password reset link has been sent to your email " + emailAddress;
        this.isMessageVisible = true;
        this.isLoading$.next(false);
      } else {
        this.isLoading$.next(false);
      }
    }, (error) => {
      this.alertService.error("A password reset link has been sent to your email " + emailAddress);
      this.isLoading$.next(false);
    });
  }

  sendPasswordResetLink(emailAddress: string) {
    this.isLoadingSendEmail$.next(true);
    this.userRegistrationService.sendPasswordResetLink(emailAddress).subscribe((result) => {
      if (result) {
        this.memberMessage = "A password reset link has been sent to your email " + emailAddress;
        this.isMessageVisible = true;
        this.isLoadingSendEmail$.next(false);
        this.isResend = true;
      }
      else {
        this.memberMessage = "User to reset password, please call Contact Center on (086222132)";
        this.isMessageVisible = true;
        this.isLoadingSendEmail$.next(false);
      }
    }, (error) => {
      this.alertService.error("A password reset link has been sent to your email " + emailAddress);
      this.isLoadingSendEmail$.next(false);
    });
  }
}

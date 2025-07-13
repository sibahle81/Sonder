import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AlertService } from 'src/app/shared/services/alert.service';
import { UserRegistrationService } from '../services/user-registration.service';
import { UserRegistrationDetails } from 'src/app/shared/models/user-registration-details';
import { AuthService } from '../../core/services/auth.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { UserProfileType } from 'src/app/shared/enums/user-profile-type.enum';
import { PortalTypeEnum } from 'src/app/shared/enums/portal-type-enum';

/** Error when invalid control is dirty, touched, or submitted. */
export class PasswordErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-member-activation',
  templateUrl: './member-activation.component.html',
  styleUrls: ['./member-activation.component.scss']
})
export class MemberActivationComponent implements OnInit {

  @Input() public passwordToCheck: string;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingResend$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  form: FormGroup;
  userDetails: UserRegistrationDetails;
  memberMessage: string;
  passwordPattern: any = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[)(@$!%*?&#^_+])[A-Za-z\\d)(@$!%*?&#^_+]{6,}$";
  errorMgs: string;
  passwordIsValid = false;
  isMessageVisible = false;
  isActivationVisible = false;
  activateId: string
  isResend: boolean;
  matcher = new PasswordErrorStateMatcher();
  userProfileType: string = "Member";

  constructor(
    private authService: AuthService,
    private readonly formBuilder: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly alertService: AlertService,
    private readonly userRegistrationService: UserRegistrationService) { }

  ngOnInit(): void {
    this.isLoadingResend$.next(false);
    this.isResend = false;
    this.isMessageVisible = false;
    this.createForm();
    this.form.controls['name'].disable();
    this.form.controls['surname'].disable();
    this.activatedRoute.params.subscribe((params: any) => {
      this.activateId = params.id;
      this.getUserDetails(params.id);
    });
    this.errorMgs = 'Minimum six characters, at least one uppercase letter, one lowercase letter, one special character and one number'
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      name: new FormControl(''),
      surname: new FormControl(''),
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, {
      validators: this.password.bind(this)
    });
  }

  getUserDetails(activateId: string) {
    this.isLoading$.next(true);
    this.userRegistrationService.getUserDetailsByActivateId(activateId).subscribe((result) => {
      if (result) {
        this.userDetails = result;
        if (this.userDetails.userProfileType == UserProfileType.HealthcareProvider) {
          this.userProfileType = "User";
        }
        if (this.userDetails.userActivationLinkIsActive == false) {
          this.memberMessage = this.userDetails.userActivationMessage;
          this.isMessageVisible = true;
          this.isActivationVisible = false;
          this.isLoading$.next(false);
        }
        else {
          this.isMessageVisible = false;
          this.isActivationVisible = true;

          if (!this.userDetails.surname) {
            this.memberMessage = 'Dear ' + this.userDetails.name + ', Please enter password, confirm password and click Submit to activate.';
          } else {
            this.memberMessage = 'Dear ' + this.userDetails.surname + ', Please enter password, confirm password and click Submit to activate.';
          }

          this.form.patchValue({
            name: this.userDetails.name,
            surname: this.userDetails.surname
          });
          this.isLoading$.next(false);
        }
      } else {
        this.alertService.error('Member activation details not found');
      }
    });
    this.isLoading$.next(false);
  }

  Submit() {
    this.userDetails.password = this.form.get('password').value;
    const confirmPassword = this.form.get('confirmPassword').value;

    if (this.userDetails.password && this.userDetails.password == confirmPassword) {
      this.isLoading$.next(true);
      this.userRegistrationService.createUser(this.userDetails).subscribe((result) => {
        if (result) {
          if (this.userDetails.portalType == PortalTypeEnum.RMA) {
            this.redirectToRma();
          } else {
            this.authService.login();
          }
          this.alertService.success(result);
          this.isLoading$.next(false);
        }
      }, (error) => {
        this.alertService.error(error.message);
        this.isLoading$.next(false);
      });
    }
    else {
      this.alertService.error('Password and Confirm Password do not match');
    }
  }

  ResendActivation() {
    this.isLoadingResend$.next(true);
    this.userRegistrationService.resendUserActivation(this.activateId).subscribe((result) => {
      if (result) {
        this.alertService.success('An activation email will be resent through to complete registration');
        this.isLoadingResend$.next(false);
        this.isResend = true;
      }
      this.isLoadingResend$.next(false);
    }, (error) => {
      this.alertService.error(error.message);
      this.isLoadingResend$.next(false);
    });
  }

  password(formGroup: FormGroup) {
    const { value: password } = formGroup.get('password');
    const { value: confirmPassword } = formGroup.get('confirmPassword');
    return password === confirmPassword ? null : { passwordNotMatch: true };
  }

  checkStrength(p) {
    let force = 0;

    const regex = /[#$-/:-?{-~!"^_@`\[\]]/g;
    const lowerLetters = /[a-z]+/.test(p);
    const upperLetters = /[A-Z]+/.test(p);
    const numbers = /[0-9]+/.test(p);
    const symbols = regex.test(p);
    const flags = [lowerLetters, upperLetters, numbers, symbols];

    let passedMatches = 0;
    for (const flag of flags) {
      passedMatches += flag === true ? 1 : 0;
    }

    force += 2 * p.length + ((p.length >= 10) ? 1 : 0);
    force += passedMatches * 10;

    force = (p.length <= 6) ? Math.min(force, 10) : force;

    force = (passedMatches === 1) ? Math.min(force, 10) : force;
    force = (passedMatches === 2) ? Math.min(force, 20) : force;
    force = (passedMatches === 3) ? Math.min(force, 30) : force;
    force = (passedMatches === 4) ? Math.min(force, 40) : force;

    return force;
  }

  passwordValid(event) {
    this.passwordIsValid = event;
  }

  redirectToRma(): void {
    window.location.href = this.authService.ssoissuer;
  }
}

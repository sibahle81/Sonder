import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule,FormGroupDirective,NgForm } from '@angular/forms';
import { BehaviorSubject, from } from 'rxjs';
import { AlertService } from 'src/app/shared/services/alert.service';
import { UserService } from 'src/app/core/services/user.service';
import { UserRegistrationService } from '../services/user-registration.service';
import { UserRegistrationDetails } from 'src/app/shared/models/user-registration-details';
import { AuthService } from '../../core/services/auth.service';
import {ErrorStateMatcher} from '@angular/material/core';

/** Error when invalid control is dirty, touched, or submitted. */
export class PasswordErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  @Input() public passwordToCheck: string;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  form: FormGroup;
  userDetails: UserRegistrationDetails;
  memberMessage: string;
  passwordPattern: any = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[)(@$!%*?&#^_+])[A-Za-z\\d)(@$!%*?&#^_+]{6,}$";
  errorMgs: string;
  passwordIsValid = false;
  isMessageVisible = false;
  isActivationVisible = false;
  activateId: string
  matcher = new PasswordErrorStateMatcher();

  constructor(private authService: AuthService,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly alertService: AlertService,
    private readonly userService: UserService,
    private readonly userRegistrationService: UserRegistrationService) { }

  ngOnInit(): void {
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

  getUserDetails(activateId: string){
    this.isLoading$.next(true);
    this.userRegistrationService.getUserDetailsByActivateId(activateId).subscribe((result) => {
      if (result) {
        this.userDetails = result;
        if(this.userDetails.userActivationLinkIsActive == false){
          this.memberMessage = this.userDetails.userActivationMessage;
          this.isMessageVisible = true;
          this.isActivationVisible = false;
          this.isLoading$.next(false);
        }
        else{
          this.isMessageVisible = false;
          this.isActivationVisible = true;
          this.memberMessage = 'Dear ' + this.userDetails.surname + ', Please enter password, confirm password and click Submit to reset.';
          this.form.patchValue({
            name: this.userDetails.name,
            surname: this.userDetails.surname
          });
          this.isLoading$.next(false);
        }
      } else {
        this.alertService.error('Some problem occured.');
      }
    }, (error) => {
      this.alertService.error('Some problem occured.');
    });
    this.isLoading$.next(false);
  }

  password(formGroup: FormGroup) {
    const { value: password } = formGroup.get('password');
    const { value: confirmPassword } = formGroup.get('confirmPassword');
    return password === confirmPassword ? null : { passwordNotMatch: true };
  }

  Submit(){
    this.userDetails.password = this.form.get('password').value;
        const confirmPassword = this.form.get('confirmPassword').value;

        if (this.userDetails.password == confirmPassword && (this.userDetails.password != '')){
          this.isLoading$.next(true);
          this.userRegistrationService.UpdateUser(this.userDetails).subscribe((result) => {
            if(result > 0){
              this.alertService.success("Reset password success");
              this.isLoading$.next(false);
              this.authService.login();
            }
            else{
              this.alertService.success("Failed to reset password");
              this.isLoading$.next(false);
            }
          }, (error) => {
            this.alertService.error(error.message);
            this.isLoading$.next(false);
          });
        }
        else{
          this.alertService.error('Password and Confirm Password do not match');
        }
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

}

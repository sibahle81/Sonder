import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { LoginService } from 'projects/shared-services-lib/src/lib/services/security/login/login.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { ValidateEmail } from 'projects/shared-utilities-lib/src/lib/validators/email.validator';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
    resetPasswordForm: UntypedFormGroup;
    returnUrl: string;
    hide = true;
    email: string;

    constructor(
        private readonly formBuilder: UntypedFormBuilder,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly loginService: LoginService,
        private readonly alertService: AlertService

    ) {

        this.createForm();
    }

    ngOnInit() {

    }

    createForm(): void {
        this.resetPasswordForm = this.formBuilder.group({
            email: ['', [ValidateEmail, Validators.required]],
            newPassword: ['', [Validators.required]],
            confirmNewPassword: ['', [Validators.required]]
        });
    }

    readForm(): string {
        this.email = this.resetPasswordForm.value.email as string;

        return this.email;
    }

    resetPassword(): void {
        if (this.resetPasswordForm.valid) {
            this.resetPasswordForm.disable();
            this.alertService.loading('resetting Password...');
            const formUser = this.readForm();
            this.loginService.forgotPassword(formUser).subscribe(response => {
                this.alertService.clear();
            }, () => this.error('Password Reset Failed'));

        }
    }

    private error(message: any): void {
        this.alertService.clear();
        this.alertService.error(message);
        this.resetPasswordForm.enable();
    }
}

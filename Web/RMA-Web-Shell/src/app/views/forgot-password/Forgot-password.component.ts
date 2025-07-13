import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { LoginService } from 'projects/shared-services-lib/src/lib/services/security/login/login.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { ValidateEmail } from 'projects/shared-utilities-lib/src/lib/validators/email.validator';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
    forgotPasswordForm: UntypedFormGroup;
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
        this.forgotPasswordForm = this.formBuilder.group({
            email: ['', [ValidateEmail, Validators.required]]
        });
    }

    readForm(): string {
        this.email = this.forgotPasswordForm.value.email as string;

        return this.email;
    }

    getReturnOrDefaultUrl(): string {
        return this.route.snapshot.queryParams.returnUrl || '/';
    }


    forgetPassword(): void {
        if (this.forgotPasswordForm.valid) {
            this.forgotPasswordForm.disable();
            this.alertService.loading('Forgot Password...');
            const formUser = this.readForm();
            this.loginService.forgotPassword(this.email).subscribe(response => {
                this.alertService.clear();
            }, () => this.error('Reset Failed'));

        }
    }

    private error(message: any): void {
        this.alertService.clear();
        this.alertService.error(message);
        this.forgotPasswordForm.enable();
    }
}

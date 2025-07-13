import { Validator, ValidationErrors, UntypedFormControl, NG_VALIDATORS } from '@angular/forms';
import { SecurityService } from '../security/shared/security.service';
import { Injectable, Directive } from '@angular/core';

function validateEmailTaken(securityService: SecurityService) {
    return (control: UntypedFormControl): ValidationErrors => {
        var email = control.value as string;
        if (email && email.length > 4) {
            this.securityService.checkIfEmailTaken(email).subscribe((exists: boolean) => {
                if (!exists) {
                    return { emailTaken: { valid: false } };
                }
                return null;
            });
        }
        return null;
    };
}

@Directive({
    selector: '[validateEmailTaken]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: EmailTakenValidator, multi: true }
    ]
})
export class EmailTakenValidator implements Validator{

    validator: Function;

    constructor(securityService: SecurityService) {
        this.validator = validateEmailTaken(securityService);
    }

    validate(control: UntypedFormControl): ValidationErrors {
        return this.validator(control);
    }
}
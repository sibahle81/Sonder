import { AbstractControl } from '@angular/forms';

export class ContactValidator {

    static emailAddressRequired(campaignType: number): any {
        return (control: AbstractControl): any => {
            if (campaignType === 1) {
                if (control == null || control.value == null || control.value === '') {
                    return { emailRequired: true };
                } else {
                    // tslint:disable-next-line:max-line-length
                    const emailRegex = new RegExp(/^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
                    if (!emailRegex.test(control.value)) {
                        return { emailInvalid: true };
                    }
                }
            }
            return null;
        };
    }

    static phoneNumberRequired(campaignType: number): any {
        return (control: AbstractControl): any => {
            if (campaignType === 2 || campaignType === 3 || campaignType === 4) {
                if (control == null || control.value == null || control.value === '') {
                    return { phoneNoRequired: true };
                } else {
                    const phoneRegex = new RegExp(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/);
                    if (!phoneRegex.test(control.value)) {
                        return { phoneNoInvalid: true };
                    }
                }
            }
            return null;
        };
    }
}

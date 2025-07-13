import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { OnInit, Directive } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Router } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Location } from '@angular/common';

@Directive()
export abstract class InsuredLifeWizardBase extends DetailsComponent implements OnInit {
    form: UntypedFormGroup;
    isWizard: boolean;
    context: WizardContext;
    protected constructor(
        protected readonly appEventsManager: AppEventsManager,
        protected readonly alertService: AlertService,
        router: Router,
        protected readonly formBuilder: UntypedFormBuilder,
        protected readonly location: Location,
        readonly name: string) {

        super(appEventsManager, alertService, router, null, null, 0);
    }


    ngOnInit(): void {
        this.createForm();
    }

    /** @description Create the angular form on the component. */
    abstract createForm(): void;

    /** @description Reads the data from the angular form and returns the model. */
    abstract readForm(): any;

    /**
     * @description Populate the form with the client data.
     * @param {any} item The model that will populate the form.
     * */
    abstract setForm(value: any): void;

    abstract validate(context: WizardContext, displayName: string): ValidationResult;

    /**
     * disables the form control
     */
    disable(): void {
        if (this.form){
            this.form.disable();
        }
    }

    /**
     * Enabls the form control
     */
    enable(): void {
        if (this.form) {
            this.form.enable();
        }
    }
}

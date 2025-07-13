import { Component, OnInit, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ContactDetailsComponent } from 'projects/clientcare/src/app/client-manager/views/contact-details/contact-details.component';
import { WizardComponentInterface } from '../../../../../../shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BreadcrumbClientService } from 'projects/clientcare/src/app/client-manager/shared/services/breadcrumb-client.service';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ClientService } from 'projects/clientcare/src/app/client-manager/shared/services/client.service';
import { ContactService } from 'projects/clientcare/src/app/client-manager/shared/services/contact.service';
import { Contact } from 'projects/clientcare/src/app/dashboard-components/contact';
import { WizardContext } from '../../../../../../shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ValidationResult } from '../../../../../../shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Client } from 'projects/clientcare/src/app/client-manager/shared/Entities/client';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';

@Component({
    templateUrl: './contact-wizard.component.html',
    providers: [DatePipe]
})
export class ContactWizardComponent extends ContactDetailsComponent implements WizardComponentInterface {
    @Input()
    step: string;
    @Input()
    firstName: string;
    @Input()
    displayName: string;
    showServiceTypes: boolean;
    singleDataModel = false;

    constructor(
        authService: AuthService,
        breadcrumbService: BreadcrumbClientService,
        formBuilder: FormBuilder,
        router: Router,
        alertService: AlertService,
        appEventsManager: AppEventsManager,
        activatedRoute: ActivatedRoute,
        lookUpService: LookupService,
        clientService: ClientService,
        contactService: ContactService) {

        super(router, breadcrumbService, appEventsManager, alertService, formBuilder, activatedRoute, contactService, lookUpService, clientService, authService);
    }

    wizardReadFormData(context: WizardContext): any {
        const contactDetail = this.readForm();
        return contactDetail;
    }

    wizardPopulateForm(context: WizardContext) {
        if (context.currentData) {
            this.setForm(context.currentData);
        } else {
            this.createForm(0);
        }

        this.checkWizardIndividual(context);
    }

    wizardValidateForm(context: WizardContext): ValidationResult {
        this.wizardPopulateForm(context);
        return this.getFormValidationResult(this.displayName);
    }

    enable(): void {
        this.form.enable();
    }

    disable(): void {
        this.form.disable();
    }

    checkWizardIndividual(context: WizardContext): void {
        const client = context.getDataByName('ClientWizardComponent') as Client;

        if (client.clientTypeId !== ClientTypeEnum.Individual) {
            this.showServiceTypes = false;
            const contact = context.currentData ? context.currentData as Contact : null;
            const value = contact ? contact.contactTypeId : 0;
            this.createContactTypeControl(value);
        } else {
            this.showServiceTypes = false;
        }
    }
}

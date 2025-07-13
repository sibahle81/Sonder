import { Component, OnInit, Input } from '@angular/core';
import { ClientDetailsComponent } from 'projects/clientcare/src/app/client-manager/views/client-details/client-details.component';
import { WizardComponentInterface } from '../../../../../../shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BreadcrumbClientService } from 'projects/clientcare/src/app/client-manager/shared/services/breadcrumb-client.service';
import { ClientService } from 'projects/clientcare/src/app/client-manager/shared/services/client.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserPreferenceService } from 'projects/shared-services-lib/src/lib/services/userpreferenceservice/userpreferenceservice.service';
import { WizardContext } from '../../../../../../shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ValidationResult } from '../../../../../../shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Location } from '@angular/common';
@Component({
    selector: 'client-wizard',
    templateUrl: './client-wizard.component.html'
})
export class ClientWizardComponent extends ClientDetailsComponent implements WizardComponentInterface {
    @Input() step: string;
    @Input() firstName: string;
    @Input() displayName: string;
    singleDataModel = false;

    constructor(
        authService: AuthService,
        breadcrumbService: BreadcrumbClientService,
        clientService: ClientService,
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        lookupService: LookupService,
        location: Location,
        router: Router,
        activatedRoute: ActivatedRoute,
        userPreferenceService: UserPreferenceService) {
        super(location, authService, breadcrumbService, clientService, appEventsManager, alertService, router, activatedRoute, userPreferenceService);
    }

    wizardReadFormData(context: WizardContext): any {
        const client = this.readForm();
        return client;
    }

    wizardPopulateForm(context: WizardContext): void {
        this.selected = context.currentData.clientTypeId;

        this.clientControls[1] = this.clientIndividualComponent;
        this.clientControls[2] = this.clientAffinityComponent;
        this.clientControls[3] = this.clientCompanyComponent;

        this.setForm(context.currentData);
        const clientControl = this.getSelectedClientControl();
        if (!context.wizard.lockedReason) { clientControl.enable(); }
    }

    wizardValidateForm(context: WizardContext): ValidationResult {
        const validationResult = new ValidationResult(this.displayName);
        this.wizardPopulateForm(context);
        const clientControl = this.getSelectedClientControl();

        if (clientControl.form.status === 'PENDING') {
            validationResult.isPending = true;
            validationResult.statusChange = clientControl.form.statusChanges;
        }

        Object.keys(clientControl.form.controls).forEach(key => {
            if (!clientControl.form.valid && clientControl.form.controls[key].enabled && !clientControl.form.controls[key].valid) {
                validationResult.errors++;
                validationResult.errorMessages.push('Field "' + key + '" is invalid');
            }
        });

        return validationResult;
    }

    enable(): void {
        const clientControl = this.getSelectedClientControl();
        if (clientControl) { clientControl.enable(); }
    }

    disable(): void {
        const clientControl = this.getSelectedClientControl();
        if (clientControl) { clientControl.disable(); }
    }
}

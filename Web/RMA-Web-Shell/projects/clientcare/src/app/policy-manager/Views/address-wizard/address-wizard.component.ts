import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AddressDetailsComponent } from 'projects/clientcare/src/app/client-manager/views/address-details/address-details.component';
import { WizardComponentInterface } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadcrumbClientService } from 'projects/clientcare/src/app/client-manager/shared/services/breadcrumb-client.service';
import { UntypedFormBuilder } from '@angular/forms';
import { AddressService } from 'projects/clientcare/src/app/client-manager/shared/services/address.service';
import { BranchService } from 'projects/clientcare/src/app/client-manager/shared/services/branch.service';
import { DepartmentService } from 'projects/clientcare/src/app/client-manager/shared/services/department.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { GroupService } from 'projects/clientcare/src/app/client-manager/shared/services/group.service';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

@Component({
    templateUrl: './address-wizard.component.html',
    providers: [DatePipe]
})
export class AddressWizardComponent extends AddressDetailsComponent implements WizardComponentInterface {
    @Input() step: string;
    @Input() firstName: string;
    @Input() displayName: string;
    singleDataModel = false;

    constructor(
        alertService: AlertService,
        appEventsManager: AppEventsManager,
        router: Router,
        breadcrumbService: BreadcrumbClientService,
        formBuilder: UntypedFormBuilder,
        activatedRoute: ActivatedRoute,
        addressService: AddressService,
        branchService: BranchService,
        departmentService: DepartmentService,
        lookUpService: LookupService,
        groupService: GroupService) {

        super(alertService, appEventsManager, router, breadcrumbService, formBuilder, activatedRoute, addressService, branchService, departmentService, lookUpService, groupService);
    }

    wizardReadFormData(context: WizardContext): any {
        const address = this.readForm();
        return address;
    }

    wizardPopulateForm(context: WizardContext) {
        this.setForm(context.currentData);
    }

    wizardValidateForm(context: WizardContext): ValidationResult {
        this.createForm();
        this.setAddressForm(context.currentData);

        this.wizardPopulateForm(context);
        return this.getFormValidationResult(this.displayName);
      }

    enable(): void {
        this.form.enable();
    }

    disable(): void {
        this.form.disable();
    }
}

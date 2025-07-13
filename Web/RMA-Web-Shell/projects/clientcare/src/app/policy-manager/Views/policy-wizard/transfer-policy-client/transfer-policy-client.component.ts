import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ViewChild, OnInit, AfterViewInit, Input, Component } from '@angular/core';
import { ClientSearchComponent } from 'projects/clientcare/src/app/shared/search/client-search/client-search.component';
import { WizardComponentInterface } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';
import { UntypedFormGroup, FormBuilder } from '@angular/forms';
import { Client } from 'projects/clientcare/src/app/client-manager/shared/Entities/client';
import { ClientWizardComponent } from '../../client-wizard/client-wizard.component';
import { ClientSearchDataSource } from 'projects/clientcare/src/app/shared/search/client-search/client-search.datasource';
import { Router } from '@angular/router';
import { ClientService } from 'projects/clientcare/src/app/client-manager/shared/services/client.service';

@Component({
    templateUrl: './transfer-policy-client.component.html'
})
export class TransferPolicyClientWizardComponent extends ClientSearchComponent implements WizardComponentInterface, OnInit, AfterViewInit {
    isWizard = true;
    form: UntypedFormGroup;
    client: Client;
    isSelected = false;
    singleDataModel = false;
    @Input() step: string;
    @Input() firstName: string;
    @Input() displayName: string;

    @ViewChild(ClientWizardComponent) clientDetails: ClientWizardComponent;
    dataSource: ClientSearchDataSource;
    // constructor(
    //     dataSource: ClientSearchDataSource,
    //     formBuilder: FormBuilder,
    //     router: Router,
    //     clientService: ClientService) {
    //     super(dataSource,formBuilder, router);
    // }

    ngOnInit(): void {
        super.ngOnInit();
        this.clientDetails.ngOnInit();
    }

    ngAfterViewInit(): void {
        this.clientDetails.ngAfterViewInit();
    }

    wizardReadFormData(context: WizardContext): any {
        return this.client;
    }

    wizardPopulateForm(context: WizardContext): void {
        if (context.currentData) {
            this.client = context.currentData as Client;
            this.setClientDetails();
        }
    }

    wizardValidateForm(context: WizardContext): ValidationResult {
        const validationResult = new ValidationResult(this.displayName);
        this.wizardPopulateForm(context);
        if (this.client && this.client.id) {
        } else {
            validationResult.errorMessages.push('Client Id is required');
            validationResult.errors++;
        }
        return validationResult;
    }

    search(): void {
        this.isSelected = false;
        super.search();
    }

    onSelect(client: any): void {
        this.isSelected = true;

        this.client = client;
        this.setClientDetails();
    }

    setClientDetails(): void{
        if (this.client && this.client.id) {
            this.clientDetails.getClient(this.client.id, true);
            this.isSelected = true;
        }

        this.clientDetails.isWizard = true;
        this.clientDetails.disable();
    }

    enable(): void {
        this.form.enable();
    }

    disable(): void {
        this.form.disable();
    }
}

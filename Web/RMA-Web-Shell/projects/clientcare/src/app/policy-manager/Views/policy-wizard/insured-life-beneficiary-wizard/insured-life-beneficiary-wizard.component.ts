import { Component, ViewChild, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WizardComponentInterface } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';
import { InsuredLifeWizardBase } from '../insured-life-base';
import { ClientTypeEnum } from '../../../shared/enums/client-type-enum';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Client } from 'projects/clientcare/src/app/client-manager/shared/Entities/client';
import { InsuredLivesCompanyWizardComponent } from '../insured-life-company-wizard/insured-life-company-wizard.component';
import { InsuredLivesOtherWizardComponent } from '../insured-life-other-wizard/insured-life-other-wizard.component';
import { ProductOptionCover } from 'projects/clientcare/src/app/product-manager/obsolete/product-option-cover';

@Component({
    templateUrl: './insured-life-beneficiary-wizard.component.html',
    providers: [DatePipe]
})
export class InsuredLifeBeneficiaryWizardComponent implements WizardComponentInterface, OnInit {
    isWizard = true;
    singleDataModel = false;

    firstName: string;
    displayName: string;
    step: string;
    @ViewChild(InsuredLivesCompanyWizardComponent)
    insuredLivesCompanyWizardComponent: InsuredLivesCompanyWizardComponent;
    @ViewChild(InsuredLivesOtherWizardComponent)
    insuredLivesOtherWizardComponent: InsuredLivesOtherWizardComponent;
    insuredLifeControl: InsuredLifeWizardBase;
    clientType: ClientTypeEnum;
    productOptionCovers: ProductOptionCover[];

    ngOnInit(): void {
    }

    wizardReadFormData(context: WizardContext): any {
        if (this.insuredLifeControl) {
            return this.insuredLifeControl.readForm();
        }
    }

    wizardPopulateForm(context: WizardContext): void {
        if (context.currentData) {
            this.setInsuredLifeControl(context);
        }
        if (this.insuredLifeControl) {
            this.insuredLifeControl.setForm(context.currentData);
        }
    }

    wizardValidateForm(context: WizardContext): ValidationResult {
        this.setInsuredLifeControl(context);
        if (this.insuredLifeControl) {
            return this.insuredLifeControl.validate(context, this.displayName);
        }
    }

    disable(): void {
        if (this.insuredLifeControl) {
            this.insuredLifeControl.disable();
        }
    }

    enable(): void {
        if (this.insuredLifeControl) {
            this.insuredLifeControl.enable();
        }
    }

    setInsuredLifeControl(context: WizardContext): any {
        const client = context.getDataByName('ClientWizardComponent') as Client;
        this.clientType = client.clientTypeId as ClientTypeEnum;

        switch (this.clientType) {
        case ClientTypeEnum.Company:
            this.insuredLifeControl = this.insuredLivesCompanyWizardComponent;
            break;
        default:
            this.insuredLifeControl = this.insuredLivesOtherWizardComponent;
        }

        if (this.insuredLifeControl) {
            this.insuredLifeControl.context = context;
            this.insuredLifeControl.createForm();
        }
    }
}

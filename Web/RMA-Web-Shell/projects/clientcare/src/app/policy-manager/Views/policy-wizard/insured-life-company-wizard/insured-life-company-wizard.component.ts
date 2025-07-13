import { Component, OnInit } from '@angular/core';
import { InsuredLifeWizardBase } from '../insured-life-base';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { UntypedFormBuilder } from '@angular/forms';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { InsuredLife } from '../../../shared/entities/insured-life';
import { Location } from '@angular/common';

@Component({
    templateUrl: './insured-life-company-wizard.component.html',
    selector: 'insured-life-company'
})
export class InsuredLivesCompanyWizardComponent extends InsuredLifeWizardBase implements OnInit {

    constructor(alertService: AlertService,
                location: Location,
                router: Router,
                appEventsManager: AppEventsManager,
                formBuilder: UntypedFormBuilder) {
        super(appEventsManager, alertService, router, formBuilder, location, 'Insured Lives');
    }

    validate(context: WizardContext, displayName: string): ValidationResult {
        const validationResult = new ValidationResult(displayName);
        return validationResult;
    }

    createForm(): void {}

    readForm(): InsuredLife[] {
        return new Array();
    }

    setCurrentValues(): void {

    }

    setForm(insuredLives: InsuredLife[]): void {

    }

    save(): any { throw new Error('Not implemented'); }

    ngOnInit(): void {

    }
}

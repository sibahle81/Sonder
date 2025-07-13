import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Brokerage } from '../../models/brokerage';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BrokerageCategory } from 'projects/clientcare/src/app/product-manager/models/brokerage-category';
import { UntypedFormBuilder } from '@angular/forms';

@Component({
    selector: 'binderpartner-fees-list',
    templateUrl: './binderpartner-fees.component.html',
    styleUrls:['./binderpartner-fees.component.css']
})
export class BinderPartnerFeesComponent extends WizardDetailBaseComponent<Brokerage> {
    dataSource: BrokerageCategory[] = [];
    displayedColumns = ['description', 'categoryNo', 'subCategoryNo', 'productClassText', 'adviceDateActive', 'intermediaryDateActive' ];

    createForm(id: number): void {
        this.form = this.formBuilder.group({
            id: [id]
        });
    }

    onLoadLookups(): void {
    }

    populateModel(): void {
        this.getBrokerageFscaLicenseCategories();
    }

    populateForm(): void {
        this.getBrokerageFscaLicenseCategories();
    }

    onValidateModel(validationResult: ValidationResult): ValidationResult {
        return validationResult;
    }

    constructor(
        appEventsManager: AppEventsManager,
        activatedRoute: ActivatedRoute,
        private readonly formBuilder: UntypedFormBuilder,
        authService: AuthService) {
        super(appEventsManager, authService, activatedRoute);
        this.createForm(0);
    }

    getBrokerageFscaLicenseCategories(): void {
        this.dataSource = this.model.categories;
        this.loadingStop();
    }
}

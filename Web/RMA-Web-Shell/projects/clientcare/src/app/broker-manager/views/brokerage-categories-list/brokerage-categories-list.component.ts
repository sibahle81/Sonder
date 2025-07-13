import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Brokerage } from '../../models/brokerage';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BrokerageCategory } from 'projects/clientcare/src/app/product-manager/models/brokerage-category';
import { UntypedFormBuilder } from '@angular/forms';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BrokerItemTypeEnum } from '../../models/enums/broker-item-type.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'brokerage-categories-list',
    templateUrl: './brokerage-categories-list.component.html',
    styleUrls:['./brokerage-categories-list.component.css']
})
export class BrokerageCategoriesListComponent extends WizardDetailBaseComponent<Brokerage> {
    dataSource: BrokerageCategory[] = [];
    displayedColumns = ['description', 'categoryNo', 'subCategoryNo', 'productClassText', 'adviceDateActive', 'intermediaryDateActive', 'actions' ];

    constructor(
        appEventsManager: AppEventsManager,
        activatedRoute: ActivatedRoute,
        private readonly formBuilder: UntypedFormBuilder,
        authService: AuthService,
        public dialog: MatDialog) {
        super(appEventsManager, authService, activatedRoute);
        this.createForm(0);
    }

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

    getBrokerageFscaLicenseCategories(): void {
        this.dataSource = this.model.categories;
        this.loadingStop();
    }

    openAuditDialog(category: BrokerageCategory) {
        const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
          width: '70%',
          data: {
            serviceType: ServiceTypeEnum.BrokerageManager,
            clientItemType: BrokerItemTypeEnum.BrokerageFscaLicenseCategory,
            itemId: category.id,
            heading: 'Brokerage Category Details Audit',
            propertiesToDisplay: [ 
              'Id', 'BrokerageId', 'FscaLicenseCategoryId', 'AdviceDateActive', 'IntermediaryDateActive', 'IsDeleted', 'CreatedBy', 'CreatedDate', 'ModifiedBy', 'ModifiedDate' 
            ]
          }
        });
      }
}

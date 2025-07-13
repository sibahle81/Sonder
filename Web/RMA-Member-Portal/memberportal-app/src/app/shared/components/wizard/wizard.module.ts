import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { UploadWizardComponent } from './views/upload-wizard/upload-wizard.component';
import { UserWizardListDatasource } from './views/user-wizard-list/user-wizard-list.datasource';
import { WizardApprovalStepComponent } from './views/wizard-approval-step/wizard-approval-step.component';
import { WizardCancelStepComponent } from './views/wizard-cancel-step/wizard-cancel-step.component';
import { WizardDetailsComponent } from './views/wizard-details/wizard-details.component';
import { WizardHomeComponent } from './views/wizard-home/wizard-home.component';
import { WizardHostComponent } from './views/wizard-host/wizard-host.component';
import { WizardLastViewedListComponent } from './views/wizard-last-viewed-list/wizard-last-viewed-list.component';
import { WizardLastViewedListDataSource } from './views/wizard-last-viewed-list/wizard-last-viewed-list.datasource';
import { WizardListComponent } from './views/wizard-list/wizard-list.component';
import { WizardMenuComponent } from './views/wizard-menu/wizard-menu.component';
import { WizardRulesStepComponent } from './views/wizard-rules-step/wizard-rules-step.component';
import { WizardSaveStepComponent } from './views/wizard-save-step/wizard-save-step.component';
import { WizardSearchComponent } from './views/wizard-search/wizard-search.component';
import { WizardStartStepComponent } from './views/wizard-start-step/wizard-start-step.component';
import { WizardSubmitStepComponent } from './views/wizard-submit-step/wizard-submit-step.component';
import { WizardValidationStepComponent } from './views/wizard-validation-step/wizard-validation-step.component';
import { TaskListComponent } from './views/task-list/task-list.component';
import { WizardRoutingModule } from './wizard-routing.module';
import { WizardBreadcrumbService } from './shared/services/wizard-breadcumb.service';

import { TaskListDataSource } from './views/task-list/task-list.datasource';
import { UserWizardListComponent } from './views/user-wizard-list/user-wizard-list.component';
import { CommonModule } from '@angular/common';
import { AngularMaterialsModule } from 'src/app/modules/angular-materials.module';

@NgModule({
    imports: [
        CommonModule,
        WizardRoutingModule,
        AngularMaterialsModule,
        ReactiveFormsModule,
        FormsModule,
        MatTableModule
    ],
    declarations: [
        UploadWizardComponent,
        WizardApprovalStepComponent,
        WizardCancelStepComponent,
        WizardDetailsComponent,
        WizardHomeComponent,
        WizardHostComponent,
        WizardLastViewedListComponent,
        WizardListComponent,
        WizardMenuComponent,
        WizardRulesStepComponent,
        WizardSaveStepComponent,
        WizardSearchComponent,
        WizardStartStepComponent,
        WizardSubmitStepComponent,
        WizardValidationStepComponent,
        TaskListComponent,
        UserWizardListComponent
    ],
    exports: [
        UserWizardListComponent
    ],
    entryComponents: [
        WizardLastViewedListComponent
    ],
    providers: [
        UserWizardListDatasource,
        WizardBreadcrumbService,
        WizardLastViewedListDataSource,
        TaskListDataSource
    ]
})
export class WizardModule {
    constructor() {
    }
}

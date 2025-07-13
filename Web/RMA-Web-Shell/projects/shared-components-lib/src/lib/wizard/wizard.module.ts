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
import { SharedComponentsLibModule } from '../../public-api';
import { TaskListDataSource } from './views/task-list/task-list.datasource';
import { UserWizardListComponent } from './views/user-wizard-list/user-wizard-list.component';;
import { UserWizardReassignComponent } from './views/user-wizard-reassign/user-wizard-reassign.component'
import { UserWizardListExpandComponent } from './views/user-wizard-list-expand/user-wizard-list-expand.component';
import { UserWizardListExpandDatasource } from './views/user-wizard-list-expand/user-wizard-list-expand.datasource';
import { UserWizardListPopup } from './views/user-wizard-list-popup/user-wizard-list-popup.component';
import { ConfirmDeleteComponent } from './views/confirm-delete/confirm-delete.component';

@NgModule({
    imports: [
        WizardRoutingModule,
        SharedComponentsLibModule
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
        UserWizardListComponent,
        UserWizardListExpandComponent,
        UserWizardReassignComponent,
        UserWizardListPopup,
        ConfirmDeleteComponent,
        
    ],
    exports: [
        UserWizardListComponent,
        UserWizardListExpandComponent,
        WizardLastViewedListComponent,
        
    ],
    entryComponents: [
        WizardLastViewedListComponent,
        UserWizardReassignComponent
    ],
    providers: [
        UserWizardListDatasource,
        UserWizardListExpandDatasource,
        WizardBreadcrumbService,
        WizardLastViewedListDataSource,
        TaskListDataSource,
    ]
})
export class WizardModule {
  constructor() {
  }
}

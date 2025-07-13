
import { NgModule } from '@angular/core';
import { AuditLogDatasource } from 'projects/shared-components-lib/src/lib/audit/audit-log.datasource';
import { ConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.component';
import { NotesDatasource } from 'projects/shared-components-lib/src/lib/notes/notes.datasource';
import { FileUtil } from 'projects/shared-utilities-lib/src/lib/file-utility/file-utility';
import { SharedUtilitiesLibModule } from 'projects/shared-utilities-lib/src/lib/shared-utilities-lib.module';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/lib/shared-components-lib.module';
import { SharedModelsLibModule } from 'projects/shared-models-lib/src/lib/shared-models-lib.module';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/lib/shared-services-lib.module';
import { HCPMemberRegisterUserContactsDialogComponent } from './hcp-member-register-user/hcp-member-register-user-contacts-dialog/hcp-member-register-user-contacts-dialog.component';
import { HCPMemberRegisterUserUpdateDialogComponent } from './hcp-member-register-user/hcp-member-register-user-update-dialog/hcp-member-register-user-update-dialog.component';
import { HCPMemberRegisterUserExistsDialogComponent } from './hcp-member-register-user/hcp-member-register-user-exists-dialog/hcp-member-register-user-exists-dialog.component';
import { HCPMemberRegisterUserDialogComponent } from './hcp-member-register-user/hcp-member-register-user-dialog/hcp-member-register-user-dialog.component';
import { HCPMemberRegisterUserComponent } from './hcp-member-register-user/hcp-member-register-user.component';
import { HCPMemberRegisterUserDataSource } from './hcp-member-register-user/hcp-member-register-user.datasource';

import { ClientCareSharedModule } from 'projects/clientcare/src/app/shared/clientcare.shared.module';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';

@NgModule({
    imports: [
        MaterialsModule,
        SharedModelsLibModule,
        SharedComponentsLibModule,
        SharedServicesLibModule,
        SharedUtilitiesLibModule,
        ClientCareSharedModule//important for using selectors inside hcp-member-view
    ],
    declarations: [

        HCPMemberRegisterUserComponent,
        HCPMemberRegisterUserDialogComponent,
        HCPMemberRegisterUserExistsDialogComponent,
        HCPMemberRegisterUserUpdateDialogComponent,
        HCPMemberRegisterUserContactsDialogComponent,

    ],
    exports: [

        HCPMemberRegisterUserComponent,
    ],
    providers: [
        FileUtil,
        ConfirmationDialogComponent,
        AuditLogDatasource,
        NotesDatasource,
        HCPMemberRegisterUserDataSource,
    ],
    entryComponents: [
        ConfirmationDialogComponent,
    ]
})
export class HCPMemberModule {
}

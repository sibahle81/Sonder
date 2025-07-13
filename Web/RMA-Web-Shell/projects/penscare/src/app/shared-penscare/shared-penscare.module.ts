import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalDetailsComponent } from '../pensioncase-manager/views/wizards/initiate-pension-case-wizard/personal-details/personal-details.component';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { PensionCaseDocumentComponent } from '../pensioncase-manager/views/wizards/initiate-pension-case-wizard/pension-case-documents/pension-case-document/pension-case-document.component';
import { PenscareNotesComponent } from './views/penscare-notes/penscare-notes.component';
import { PenscareNoteComponent } from './views/penscare-note/penscare-note.component';
import { TableComponent } from './views/table/table.component';
import { DeathDetailsDialogComponent } from './views/death-details-dialog/death-details-dialog.component';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/lib/shared-components-lib.module';
@NgModule({
  declarations: [
    PersonalDetailsComponent,
    PensionCaseDocumentComponent,
    PenscareNotesComponent,
    PenscareNoteComponent,
    TableComponent,
    DeathDetailsDialogComponent
  ],
  exports: [
    PersonalDetailsComponent,
    PensionCaseDocumentComponent,
    PenscareNotesComponent,
    PenscareNoteComponent,
    TableComponent,
    MaterialsModule
  ],
  imports: [
    CommonModule,
    MaterialsModule,
    SharedComponentsLibModule
  ]
})
export class SharedPenscareModule { }

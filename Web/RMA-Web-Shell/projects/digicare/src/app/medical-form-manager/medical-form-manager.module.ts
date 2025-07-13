import { NgModule } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';

import { MedicalFormManagerRoutingModule } from 'projects/digicare/src/app/medical-form-manager/medical-form-manager-routing.module';
import { MedicalFormsDataSource } from 'projects/digicare/src/app/medical-form-manager/datasources/medical-forms.datasource';
import { MedicalFormViewerComponent } from 'projects/digicare/src/app/medical-form-manager/views/medical-form-viewer/medical-form-viewer.component';

@NgModule({
  declarations: [
    MedicalFormViewerComponent
  ],
  imports: [
    FrameworkModule,
    MedicalFormManagerRoutingModule
  ],
  exports: [
    MedicalFormViewerComponent
  ],
  providers: [
    MedicalFormsDataSource
  ],
  bootstrap: []
})
export class MedicalFormManagerModule { }


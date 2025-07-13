import { NgModule } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';

import { MedicalFormManagerRoutingModule } from 'projects/digicare/src/app/medical-form-manager/medical-form-manager-routing.module';
import { MedicalFormManagerModule } from 'projects/digicare/src/app/medical-form-manager/medical-form-manager.module';
import { WorkManagerRoutingModule } from 'projects/digicare/src/app/work-manager/work-manager-routing.module';
import { WorkManagerModule } from 'projects/digicare/src/app/work-manager/work-manager.module'

import { DigiCareMainRoutingModule } from 'projects/digicare/src/app/app-routing.module';
import { DigiManagerModule } from 'projects/digicare/src/app/digi-manager/digi-manager.module';

import { MedicalFormsListComponent } from 'projects/digicare/src/app/medical-form-manager/views/medical-forms-list/medical-forms-list.component';
import { MedicalFormsOverviewComponent } from 'projects/digicare/src/app/medical-form-manager/views/medical-forms-overview/medical-forms-overview.component';
import { MedicalFormsSearchComponent } from 'projects/digicare/src/app/medical-form-manager/views/medical-forms-search/medical-forms-search.component';

 //components

@NgModule({
  declarations: [

  MedicalFormsListComponent,
  MedicalFormsSearchComponent,
  MedicalFormsOverviewComponent],//for components
  imports: [
    FrameworkModule,
    DigiManagerModule,
    DigiCareMainRoutingModule,
    WorkManagerModule,
    WorkManagerRoutingModule,
    MedicalFormManagerModule,
    MedicalFormManagerRoutingModule
  ],//for modules
  exports: [
    MedicalFormManagerModule
  ],
  providers: [
   // DigiCareService
  ],
  bootstrap: []
})
export class DigiCareMainAppModule { }


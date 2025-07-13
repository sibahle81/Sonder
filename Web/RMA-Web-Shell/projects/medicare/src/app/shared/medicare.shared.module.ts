import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MedicalInvoiceSearchV2Component } from './components/medical-invoice-searchV2/medical-invoice-searchV2.component';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';

@NgModule({
    declarations: [
        MedicalInvoiceSearchV2Component        
    ],
    imports: [
        CommonModule,
        MaterialsModule
    ],
    exports: [
        CommonModule,
        MedicalInvoiceSearchV2Component,
        MaterialsModule
    ]
})

export class MedicareSharedModule {

}
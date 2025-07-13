import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductTypeComponent } from './product-type/product-type.component';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ClaimStatusPipe } from './pipes/claim-status/claim-status.pipe';
import { ClaimReasonPipe } from './pipes/claim-reason/claim-reason.pipe';
import { ClaimDescriptionPipe } from './pipes/claim-description/claim-description.pipe';
import { ClaimStatusDescriptionPipe } from './pipes/claim-status-description/claim-status-description.pipe';

@NgModule({
  declarations: [
    ProductTypeComponent,
    ClaimStatusPipe,
    ClaimReasonPipe,
    ClaimDescriptionPipe,
    ClaimStatusDescriptionPipe
  ],
  exports: [
    ProductTypeComponent,
    ClaimStatusPipe,
    ClaimReasonPipe,
    ClaimDescriptionPipe,
    ClaimStatusDescriptionPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule
  ]
})
export class SharedModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnclaimedBenefitManagerDetailsComponent } 
  from './unclaimed-benefit-manager-details/unclaimed-benefit-manager-details.component';
import { UnclaimedBenefitManagerListComponent } 
    from './unclaimed-benefit-manager-list/unclaimed-benefit-manager-list.component';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { UnclaimedBenefitManagerRouteModule } from './unclaimed-benefit-manager-route.module';
import { UnclaimedBenefitManagerService } from './unclaimed-benefit-manager.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/lib/shared-components-lib.module';

@NgModule({
  declarations: [
    UnclaimedBenefitManagerDetailsComponent,
    UnclaimedBenefitManagerListComponent
  ],
  imports: [
    CommonModule,
    MaterialsModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    UnclaimedBenefitManagerRouteModule,
    SharedComponentsLibModule
  ],
  providers: [
    UnclaimedBenefitManagerService
  ]
})
export class UnclaimedBenefitManagerModule { }

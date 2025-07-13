import { Component } from '@angular/core';
import { RolePlayerBenefitsComponent } from '../role-player-benefits/role-player-benefits.component';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { RolePlayerBenefitsChildDataSource } from './role-player-benefits-child.datasource';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
  selector: 'role-player-benefits-child',
  templateUrl: '../role-player-benefits/role-player-benefits.component.html',
  styleUrls: ['../role-player-benefits/role-player-benefits.component.css']
})
export class RolePlayerBenefitsChildComponent extends RolePlayerBenefitsComponent {
  constructor(
    productOptionService: ProductOptionService,
    lookupService: LookupService,
    datasource: RolePlayerBenefitsChildDataSource
  ) {
    super(productOptionService, lookupService, datasource);
  }
}

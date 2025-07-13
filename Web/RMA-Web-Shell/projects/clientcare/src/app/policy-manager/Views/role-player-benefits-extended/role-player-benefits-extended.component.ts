import { Component } from '@angular/core';
import { RolePlayerBenefitsComponent } from '../role-player-benefits/role-player-benefits.component';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { RolePlayerBenefitsExtendedDataSource } from './role-player-benefits-extended.datasource';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
  selector: 'role-player-benefits-extended',
  templateUrl: '../role-player-benefits/role-player-benefits.component.html',
  styleUrls: ['../role-player-benefits/role-player-benefits.component.css']
})
export class RolePlayerBenefitsExtendedComponent extends RolePlayerBenefitsComponent {

  constructor(
    productOptionService: ProductOptionService,
    lookupService: LookupService,
    datasource: RolePlayerBenefitsExtendedDataSource
  ) {
    super(productOptionService, lookupService, datasource);
  }
}

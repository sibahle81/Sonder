import { Component } from '@angular/core';
import { RolePlayerBenefitsComponent } from '../role-player-benefits/role-player-benefits.component';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { RolePlayerBenefitsSpouseDataSource } from './role-player-benefits-spouse.datasource';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
  selector: 'role-player-benefits-spouse',
  templateUrl: '../role-player-benefits/role-player-benefits.component.html',
  styleUrls: ['../role-player-benefits/role-player-benefits.component.css']
})
export class RolePlayerBenefitsSpouseComponent extends RolePlayerBenefitsComponent {

  constructor(
    productOptionService: ProductOptionService,
    lookupService: LookupService,
    datasource: RolePlayerBenefitsSpouseDataSource
  ) {
    super(productOptionService, lookupService, datasource);
  }
}

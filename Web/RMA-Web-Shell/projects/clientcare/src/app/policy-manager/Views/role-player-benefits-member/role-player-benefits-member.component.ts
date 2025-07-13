import { Component } from '@angular/core';
import { RolePlayerBenefitsComponent } from '../role-player-benefits/role-player-benefits.component';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { RolePlayerBenefitsMemberDataSource } from './role-player-benefits-member.datasource';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
  selector: 'app-role-player-benefits-member',
  templateUrl: '../role-player-benefits/role-player-benefits.component.html',
  styleUrls: ['../role-player-benefits/role-player-benefits.component.css']
})
export class RolePlayerBenefitsMemberComponent extends RolePlayerBenefitsComponent {

  constructor(
    productOptionService: ProductOptionService,
    lookupService: LookupService,
    datasource: RolePlayerBenefitsMemberDataSource
  ) {
    super(productOptionService, lookupService, datasource);
  }

}

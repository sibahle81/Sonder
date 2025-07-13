import { Component } from '@angular/core';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { ProductOptionService } from 'src/app/shared/services/product-option.service';
import { RolePlayerBenefitsComponent } from '../role-player-benefits/role-player-benefits.component';
import { RolePlayerBenefitsExtendedDataSource } from './role-player-benefits-extended.datasource';


@Component({
  selector: 'role-player-benefits-extended',
  templateUrl: '../role-player-benefits/role-player-benefits.component.html',
  styleUrls: ['../role-player-benefits/role-player-benefits.component.css']
})
export class RolePlayerBenefitsExtendedComponent extends RolePlayerBenefitsComponent {

  constructor(
    productOptionService: ProductOptionService,
    lookupService: LookupService
  ) {
    super(productOptionService, lookupService);
  }
}

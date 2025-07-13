import { Component } from '@angular/core';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { ProductOptionService } from 'src/app/shared/services/product-option.service';
import { RolePlayerBenefitsComponent } from '../role-player-benefits/role-player-benefits.component';
import { RolePlayerBenefitsChildDataSource } from './role-player-benefits-child.datasource';

@Component({
  selector: 'role-player-benefits-child',
  templateUrl: '../role-player-benefits/role-player-benefits.component.html',
  styleUrls: ['../role-player-benefits/role-player-benefits.component.css']
})
export class RolePlayerBenefitsChildComponent extends RolePlayerBenefitsComponent {
  constructor(
    productOptionService: ProductOptionService,
    lookupService: LookupService
  ) {
    super(productOptionService, lookupService);
  }
}

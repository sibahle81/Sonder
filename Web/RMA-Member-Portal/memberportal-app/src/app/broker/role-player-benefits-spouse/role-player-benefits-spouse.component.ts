import { Component } from '@angular/core';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { ProductOptionService } from 'src/app/shared/services/product-option.service';
import { RolePlayerBenefitsComponent } from '../role-player-benefits/role-player-benefits.component';

@Component({
  selector: 'role-player-benefits-spouse',
  templateUrl: '../role-player-benefits/role-player-benefits.component.html',
  styleUrls: ['../role-player-benefits/role-player-benefits.component.css']
})
export class RolePlayerBenefitsSpouseComponent extends RolePlayerBenefitsComponent {

  constructor(
    productOptionService: ProductOptionService,
    lookupService: LookupService
  ) {
    super(productOptionService, lookupService);
  }
}

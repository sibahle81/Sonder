import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'roleplayer-letters-of-good-standing',
  templateUrl: './roleplayer-letters-of-good-standing.component.html',
  styleUrls: ['./roleplayer-letters-of-good-standing.component.css']
})
export class RolePlayerLettersOfGoodStandingComponent implements OnChanges {

  @Input() rolePlayerId: number;

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  supportedPolicies: Policy[];

  constructor(
    private readonly policyService: PolicyService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayerId) {
      this.getRolePlayerPolicies();
    }
  }

  getRolePlayerPolicies() {
    this.loadingMessage$.next('loading supported policies...please wait');

    this.supportedPolicies = [];

    this.policyService.getPoliciesWithProductOptionByRolePlayer(this.rolePlayerId).subscribe(results => {
      results?.forEach(s => {
        this.isSupported(s);
      });

      this.isLoading$.next(false);
    });
  }

  isSupported(policy: Policy) {
    if (policy.productCategoryType == ProductCategoryTypeEnum.Coid) {
      this.supportedPolicies.push(policy);
    }
  }
}

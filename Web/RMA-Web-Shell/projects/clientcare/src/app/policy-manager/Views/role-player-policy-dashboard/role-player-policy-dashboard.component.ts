import { Component, OnInit } from '@angular/core';
import { RolePlayerPolicyService } from '../../shared/Services/role-player-policy.service';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { ManagePolicyTypeEnum } from '../../shared/enums/manage-policy-type-enum';

@Component({
  selector: 'app-role-player-policy-dashboard',
  templateUrl: './role-player-policy-dashboard.component.html',
  styleUrls: ['./role-player-policy-dashboard.component.css']
})
export class RolePlayerPolicyDashboardComponent implements OnInit {

  policy: RolePlayerPolicy;
  selectedManageTypeId: number;
  managePolicyTypes: Lookup[];
  isLoading: boolean;

  constructor(
    private readonly rolePlayerPolicy: RolePlayerPolicyService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly lookupService: LookupService,
    private router: Router) { }

  ngOnInit() {
    this.getManagePolicyTypes();
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.getPolicy(params.id);
      }
    });
  }

  getPolicy(id: number) {
    this.rolePlayerPolicy.getRolePlayerPolicy(id).pipe(map(data => this.policy = data)).subscribe();
  }

  setSelectedManageType(event: any) {
    this.selectedManageTypeId = event.source.value;
  }

  managePolicy(id: number) {
    switch (this.selectedManageTypeId) {
      case ManagePolicyTypeEnum.Cancel:
        this.router.navigate(['clientcare/policy-manager/role-player-policy-cancel', id]);
        break;
      case ManagePolicyTypeEnum.Reinstate:
        this.router.navigate(['clientcare/policy-manager/role-player-policy-reinstate', id]);
        break;
      case ManagePolicyTypeEnum.Edit:
        this.router.navigate(['clientcare/policy-manager/role-player-policy-edit', id]);
        break;
    }
  }

  getManagePolicyTypes(): void {
    this.lookupService.getManagePolicyTypes().subscribe(data => {
      this.managePolicyTypes = data;
    });
  }
}

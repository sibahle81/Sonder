import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolePlayer } from '../../../policy-manager/shared/entities/roleplayer';
import { BehaviorSubject } from 'rxjs';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { MemberService } from '../../services/member.service';

@Component({
  templateUrl: './holistic-role-player-view.component.html',
  styleUrls: ['./holistic-role-player-view.component.css']
})
export class HolisticRolePlayerViewComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  rolePlayerId: number;
  defaultPolicyId: number;
  tabIndex: number;

  rolePlayer: RolePlayer;

  supportedPersonTypes: RolePlayerIdentificationTypeEnum[] = [RolePlayerIdentificationTypeEnum.Person];
  supportedCompanyTypes: RolePlayerIdentificationTypeEnum[] = [RolePlayerIdentificationTypeEnum.Company, RolePlayerIdentificationTypeEnum.SundryServiceProvider, RolePlayerIdentificationTypeEnum.HealthCareProvider, RolePlayerIdentificationTypeEnum.LegalPractitioner];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly memberService: MemberService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.rolePlayerId = params.id ? +params.id : 0;
      this.defaultPolicyId = params.policyId ? params.policyId : 0;
      this.tabIndex = params.tabIndex ? +params.tabIndex : 0;
      this.getRolePlayer();
    });
  }

  getRolePlayer() {
    if (this.rolePlayerId && this.rolePlayerId > 0) {
      this.memberService.getMember(this.rolePlayerId).subscribe(result => {
        this.rolePlayer = result;
        this.isLoading$.next(false);
      });
    }
  }
}

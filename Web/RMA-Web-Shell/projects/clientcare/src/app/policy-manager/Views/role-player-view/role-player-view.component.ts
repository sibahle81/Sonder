import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BreadcrumbPolicyService } from 'projects/clientcare/src/app/policy-manager/services/breadcrumb-policy.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { Case } from 'projects/clientcare/src/app/policy-manager/shared/entities/case';
import { SpouseChildrenListComponent } from 'projects/clientcare/src/app/policy-manager/views/spouse-children-list/spouse-children-list.component';
import { ExtendedFamilyListComponent } from 'projects/clientcare/src/app/policy-manager/views/extended-family-list/extended-family-list.component';
import { RolePlayerBankingDetailComponent } from 'projects/shared-components-lib/src/lib/role-player-banking-detail/role-player-banking-detail.component';
import { RolePlayerAddressDetailComponent } from 'projects/shared-components-lib/src/lib/role-player-address-detail/role-player-address-detail.component';
import { MainMemberDetailsComponent } from '../main-member-details/main-member-details.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { RolePlayerNotesComponent } from 'projects/clientcare/src/app/policy-manager/views/role-player-notes/role-player-notes.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'roleplayer-view-component',
  templateUrl: './role-player-view.component.html',
  styleUrls: ['./role-player-view.component.css']
})
export class RolePlayerViewComponent implements OnInit {

  @ViewChild('spouseChildren', { static: true }) spouseChildComponent: SpouseChildrenListComponent;
  @ViewChild('extendedFamily', { static: true }) extendedFamilyComponent: ExtendedFamilyListComponent;
  @ViewChild(RolePlayerBankingDetailComponent, { static: true }) rolePlayerBankingDetailComponent: RolePlayerBankingDetailComponent;
  @ViewChild(RolePlayerAddressDetailComponent, { static: true }) rolePlayerAddressDetailComponent: RolePlayerAddressDetailComponent;
  @ViewChild('mainMemberDetails', { static: true }) mainMemberDetailsComponent: MainMemberDetailsComponent;
  @ViewChild(RolePlayerNotesComponent, { static: true }) notesComponent: RolePlayerNotesComponent;


  currentId: number;
  canEdit: boolean;
  isLoading: boolean;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly breadCrumbService: BreadcrumbPolicyService,
    private readonly rolePlayerService: RolePlayerService
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.checkUserPermission();
    this.breadCrumbService.setBreadcrumb('View RolePlayer');
    this.activatedRoute.params.subscribe(
      (params: any) => {
        if (params.id) {
          this.rolePlayerService.getRolePlayer(params.id).subscribe(
            rolePlayer => {
              const newCase = new Case();
              newCase.mainMember = rolePlayer;
              this.spouseChildComponent.setViewData(newCase);
              this.extendedFamilyComponent.setViewData(newCase);
              this.rolePlayerBankingDetailComponent.setViewData(rolePlayer.rolePlayerBankingDetails);
              this.rolePlayerAddressDetailComponent.setViewData(rolePlayer.rolePlayerAddresses);
              this.mainMemberDetailsComponent.setViewData(newCase);
              this.getNotes(this.currentId, ServiceTypeEnum.RolePlayerManager, 'RolePlayer');
              this.isLoading = false;
            }
          );
        }
      }
    );
  }

  private checkUserPermission(): void {
    this.canEdit = userUtility.hasPermission('Edit RolePlayer');
  }

  /** @description Gets the notes for the selected details class */
  getNotes(id: number, serviceType: number, itemType: string): void {
        const noteRequest = new NotesRequest(serviceType, itemType, id);
        this.notesComponent.getData(noteRequest);
  }

  back(): void {
    this.router.navigate(['/clientcare/policy-manager']);
  }

  edit(): void {
    // this.router.navigate(['/clientcare/broker-manager/brokerage-manager/new', this.currentId]);
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbPolicyService } from '../../services/breadcrumb-policy.service';
import { VerifyCaseComponent } from '../verify-case/verify-case.component';
import { CaseService } from '../../shared/Services/case.service';
import { PolicyContactDetailsComponent } from '../policy-contact-details/policy-contact-details.component';
import { PolicyCollectionDetailsComponent } from '../policy-collection-details/policy-collection-details.component';
import { RolePlayerPolicyNotesComponent } from '../role-player-policy-notes/role-player-policy-notes.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { GroupMemberDetailsComponent } from '../group-members-details/group-member-details.component';
import { PolicyInformationComponent } from '../policy-information/policy-information.component';
import { GroupPolicyMembersComponent } from '../group-policy-members/group-policy-members.component';

@Component({
  selector: 'app-policy-view-group',
  templateUrl: './policy-view-group.component.html',
  styleUrls: ['./policy-view-group.css']
})
export class PolicyViewGroupComponent implements OnInit {

  @ViewChild(PolicyInformationComponent, { static: true }) policyInformationComponent: PolicyInformationComponent;
  @ViewChild(VerifyCaseComponent, { static: true }) detailsComponent: VerifyCaseComponent;
  @ViewChild(GroupMemberDetailsComponent, { static: true }) groupMemberDetailsComponent: GroupMemberDetailsComponent;
  @ViewChild(GroupPolicyMembersComponent, { static: true }) groupPolicyMembersComponent: GroupPolicyMembersComponent;
  @ViewChild(PolicyCollectionDetailsComponent, { static: true }) policyCollectionDetailsComponent: PolicyCollectionDetailsComponent;
  @ViewChild(PolicyContactDetailsComponent, { static: true }) policyContactDetailsComponent: PolicyContactDetailsComponent;
  @ViewChild(RolePlayerPolicyNotesComponent, { static: true }) notesComponent: RolePlayerPolicyNotesComponent;

  isLoading: boolean;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private router: Router,
    private readonly breadCrumbService: BreadcrumbPolicyService,
    private readonly caseService: CaseService) {
  }

  ngOnInit() {
    this.breadCrumbService.setBreadcrumb('View Policy');

    this.isLoading = true;

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.caseService.getCaseByPolicyId(params.id).subscribe(result => {
          this.detailsComponent.setViewData(result, false);
          this.policyInformationComponent.setViewData(result, false);
          this.groupMemberDetailsComponent.setViewData(result, false);
          this.groupPolicyMembersComponent.setViewData(result, false);
          this.policyCollectionDetailsComponent.setViewData(result, false);
          this.policyContactDetailsComponent.setViewData(result, false);
          this.getNotes(params.id, ServiceTypeEnum.PolicyManager, 'Policy');
          this.isLoading = false;
        });
      }
    });
  }

  getNotes(id: number, serviceType: number, itemType: string): void {
    const noteRequest = new NotesRequest(serviceType, itemType, id);
    this.notesComponent.getData(noteRequest);
  }
  close() {

    this.router.navigate(['clientcare/policy-manager/policy-search/']);

  }
}

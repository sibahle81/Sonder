import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbPolicyService } from '../../services/breadcrumb-policy.service';
import { VerifyCaseComponent } from '../verify-case/verify-case.component';
import { CaseService } from '../../shared/Services/case.service';
import { SpouseChildrenListComponent } from '../spouse-children-list/spouse-children-list.component';
import { ExtendedFamilyListComponent } from '../extended-family-list/extended-family-list.component';
import { PolicyContactDetailsComponent } from '../policy-contact-details/policy-contact-details.component';
import { PolicySummaryComponent } from '../policy-summary/policy-summary.component';
import { PolicyCollectionDetailsComponent } from '../policy-collection-details/policy-collection-details.component';
import { RolePlayerPolicyNotesComponent } from '../role-player-policy-notes/role-player-policy-notes.component';
import { BeneficiaryListComponent } from '../beneficiary-list/beneficiary-list.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { PolicyInformationComponent } from '../policy-information/policy-information.component';
import { PolicyInfoMainMemberComponent } from '../policy-info-main-member/policy-info-main-member.component';
import { Case } from '../../shared/entities/case';
import { PolicyChildContactDetailsComponent } from '../policy-child-contact-details/policy-child-contact-details.component';

@Component({
  selector: 'app-policy-view',
  templateUrl: './policy-view.component.html',
  styleUrls: ['./policy-view.css']
})

export class PolicyViewComponent implements OnInit {

  @ViewChild(PolicyInformationComponent, { static: true }) policyInformationComponent: PolicyInformationComponent;
  @ViewChild(PolicyInfoMainMemberComponent, { static: true }) mainMemberDetailsComponent: PolicyInfoMainMemberComponent;
  @ViewChild(VerifyCaseComponent, { static: true }) detailsComponent: VerifyCaseComponent;
  @ViewChild(SpouseChildrenListComponent, { static: true }) spouseChildrenListComponent: SpouseChildrenListComponent;
  @ViewChild(ExtendedFamilyListComponent, { static: true }) extendedFamilyListComponent: ExtendedFamilyListComponent;
  @ViewChild(BeneficiaryListComponent, { static: true }) beneficiaryListComponent: BeneficiaryListComponent;
  @ViewChild(PolicyChildContactDetailsComponent, { static: true }) policyChildContactDetailsComponent: PolicyChildContactDetailsComponent;
  @ViewChild(PolicySummaryComponent, { static: true }) policySummaryComponent: PolicySummaryComponent;
  @ViewChild(PolicyCollectionDetailsComponent, { static: true }) policyCollectionDetailsComponent: PolicyCollectionDetailsComponent;
  @ViewChild(RolePlayerPolicyNotesComponent, { static: true }) notesComponent: RolePlayerPolicyNotesComponent;

  isLoading: boolean;
  case: Case;
  policyId: number;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly breadCrumbService: BreadcrumbPolicyService,
    private readonly caseService: CaseService,
    private router: Router,) {
  }

  ngOnInit() {
    this.breadCrumbService.setBreadcrumb('View Policy');

    this.isLoading = true;

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.policyId = params.id;
        this.caseService.getCaseByPolicyId(params.id).subscribe(result => {
          this.case = result;
          this.detailsComponent.setViewData(this.case, false);
          this.mainMemberDetailsComponent.setViewData(this.case, false);
          this.spouseChildrenListComponent.setViewData(this.case, false);
          this.extendedFamilyListComponent.setViewData(this.case, false);
          this.beneficiaryListComponent.setViewData(this.case, false);
          this.policyChildContactDetailsComponent.setViewData(this.case, false);
          this.policyCollectionDetailsComponent.setViewData(this.case, false);
          this.policyInformationComponent.setViewData(this.case, false);
          this.policySummaryComponent.setViewData(this.case, false);

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

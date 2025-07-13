import { Component, OnInit, ViewChild } from '@angular/core';
import { PolicyDetailsWidgetComponent } from '../policy-details-widget/policy-details-widget.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountSearchResult } from 'projects/fincare/src/app/shared/models/account-search-result';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { MemberConstants } from 'projects/clientcare/src/app/member-manager/member-constants'
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

@Component({
  selector: 'app-client-care-dashboard',
  templateUrl: './client-care-dashboard.component.html',
  styleUrls: ['./client-care-dashboard.component.css']
})
export class ClientCareDashboardComponent implements OnInit {

  @ViewChild(PolicyDetailsWidgetComponent, { static: false }) policyDetailsWidgit: PolicyDetailsWidgetComponent;

  backLink = '/clientcare';
  isSearchMode = true;

  roeStatusClassXIIIExpanded = false;
  roeStatusClassIVExpanded = false;

  nonCOIDMembersPerProductClassXIIIExpanded = false;
  nonCOIDMembersPerProductClassIVExpanded = false;

  newBusinessCOIDPoliciesClassXIIIExpanded = false;
  newBusinessCOIDPoliciesClassIVExpanded = false;

  cancellationsAndActiveMembersPerSubclassClassXIIIExpanded = false;
  cancellationsAndActiveMembersPerSubclassClassIVExpanded = false;

  quoteStatusOverviewExpanded = false;
  quoteAgeAnalysisOverviewExpanded = false;

  leadAgeAnalysisOverviewExpanded = false;
  leadStatusOverviewExpanded = false;
  isMember = false;
  currentUserObject: User;
  showCOIDDashBoardsFeatureFlag = FeatureflagUtility.isFeatureFlagEnabled('ShowCOIDDashboards');
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly lookupService: LookupService,
    private readonly authService: AuthService
  ) { }

  ngOnInit() {
    this.currentUserObject = this.authService.getCurrentUser();
    if(this.currentUserObject.roleName.toUpperCase() === MemberConstants.memberRole.toUpperCase()){
      this.isMember = true;
    }

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.isSearchMode = false;
      } else {
        this.isSearchMode = true;
      }
    });
  }

  onClientSelected($event: AccountSearchResult) {
    this.router.navigateByUrl(`/clientcare/member-wholistic-view/${$event.rolePlayerId}`);
  }

  maintain() {
    this.router.navigateByUrl(`/clientcare/policy-manager/new-business`);
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  toggleRoeStatusClassXIIIPanel() {
    this.roeStatusClassXIIIExpanded = !this.roeStatusClassXIIIExpanded;
  }

  toggleRoeStatusClassIVPanel() {
    this.roeStatusClassIVExpanded = !this.roeStatusClassIVExpanded;
  }

  toggleNonCOIDMembersPerProductClassXIII() {
    this.nonCOIDMembersPerProductClassXIIIExpanded = !this.nonCOIDMembersPerProductClassXIIIExpanded;
  }

  toggleNonCOIDMembersPerProductClassIV() {
    this.nonCOIDMembersPerProductClassIVExpanded = !this.nonCOIDMembersPerProductClassIVExpanded;
  }

  toggleNewBusinessCOIDPoliciesClassXIII() {
    this.newBusinessCOIDPoliciesClassXIIIExpanded = !this.newBusinessCOIDPoliciesClassXIIIExpanded;
  }

  toggleNewBusinessCOIDPoliciesClassIV() {
    this.newBusinessCOIDPoliciesClassIVExpanded = !this.newBusinessCOIDPoliciesClassIVExpanded;
  }

  toggleCancellationsAndActiveMembersPerSubclassClassXIII() {
    this.cancellationsAndActiveMembersPerSubclassClassXIIIExpanded = !this.cancellationsAndActiveMembersPerSubclassClassXIIIExpanded;
  }

  toggleCancellationsAndActiveMembersPerSubclassClassIV() {
    this.cancellationsAndActiveMembersPerSubclassClassIVExpanded = !this.cancellationsAndActiveMembersPerSubclassClassIVExpanded;
  }

  toggleQuoteStatusOverView() {
    this.quoteStatusOverviewExpanded = !this.quoteStatusOverviewExpanded;
  }

  toggleQuoteAgeAnalysisOverView() {
    this.quoteAgeAnalysisOverviewExpanded = !this.quoteAgeAnalysisOverviewExpanded;
  }

  toggleLeadAgeAnalysisOverView() {
    this.leadAgeAnalysisOverviewExpanded = !this.leadAgeAnalysisOverviewExpanded;
  }

  toggleLeadStatusOverView() {
    this.leadStatusOverviewExpanded = !this.leadStatusOverviewExpanded;
  }
}

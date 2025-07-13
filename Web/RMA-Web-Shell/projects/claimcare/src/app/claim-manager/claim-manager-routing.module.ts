import { ClaimsDocumentsComponent } from 'projects/claimcare/src/app/claim-manager/views/funeral/claims-document/claims-document.component';
import { ReverseClaimPaymentComponent } from './views/funeral/reverse-claim-payment/reverse-claim-payment.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { LandingSearchComponent } from './views/landing-search/landing-search.component';
import { RegisterFuneralComponent } from './views/funeral/register-funeral/register-funeral.component';
import { BodyCollectionComponent } from './views/funeral/body-collection/body-collection.component';
import { ForensicPathologistComponent } from './views/funeral/forensic-pathologist/forensic-pathologist.component';
import { InformantComponent } from './views/funeral/informant/informant.component';
import { MedicalPractitionerComponent } from './views/funeral/medical-practitioner/medical-practitioner.component';
import { FuneralParlorComponent } from './views/funeral/funeral-parlor/funeral-parlor.component';
import { UndertakerComponent } from './views/funeral/undertaker/undertaker.component';
import { ClaimPaymentComponent } from './views/funeral/claim-payment/claim-payment.component';
import { BeneficiaryBankingDetailsComponent } from './views/funeral/beneficiary-banking-details/beneficiary-banking-details.component';
import { ClaimHomeComponent } from './views/claim-home/claim-home.component';
import { ClaimsPolicyDetailComponent } from './views/claim-policy-detail/claims-policy-detail.component';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { WizardDetailsComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-details/wizard-details.component';
import { AddBeneficiaryBankingDetailsComponent } from './views/funeral/add-beneficiary-banking-details/add-beneficiary-banking-details.component';
import { MigratedClaimComponent } from './views/funeral/migrated-claim/migrated-claim.component';
import { ClaimNotesComponent } from './views/claim-notes/claim-notes.component';
import { DeclineClaimComponent } from './views/funeral/decline-claim/decline-claim.component';
import { CancelClaimComponent } from './views/funeral/cancel-claim/cancel-claim.component';
import { ReOpenClaimComponent } from './views/funeral/reopen-claim/reopen-claim.component';
import { ClaimRepayComponent } from './views/funeral/claim-repay/claim-repay.component';
import { ClaimsBeneficiaryBankingDetailComponent } from './views/funeral/claims-beneficiary-banking-detail/claims-beneficiary-banking-detail.component';
import { EventCaseHomeComponent } from './views/event-case-manager/event-case-home/event-case-home.component';
import { EventDetailsComponent } from './views/event-case-manager/event-details/event-details.component';
import { SearchEventComponent } from './views/event-case-manager/search-event/search-event.component';
import { ManageClaimComponent } from './views/funeral/manage-claim/manage-claim.component';
import { RegisterFuneralClaimComponent } from './views/funeral/register-funeral-claim/register-funeral-claim.component';
import { AddMemberStillbornComponent } from './views/funeral/add-member-stillborn/add-member-stillborn.component';
import { FuneralClaimDetailsComponent } from './views/funeral/funeral-claim-details/funeral-claim-details.component';
import { ClaimDashboardComponent } from './views/claim-dashboard/claim-dashboard.component';
import { ClaimViewComponent } from './views/claim-view/claim-view.component';
import { CloseClaimComponent } from './views/funeral/close-claim/close-claim.component';
import { ClaimRecoveryComponent } from './views/funeral/claim-recovery/claim-recovery.component';
import { ClaimMemberSearchComponent } from './views/claim-member-search/claim-member-search.component';
import { PersonEventSearchComponent } from './shared/claim-care-shared/person-event-search/person-event-search.component';
import { ClaimNotificationMedicalViewComponent } from './views/claim-notification-medical-view/claim-notification-medical-view.component';
import { EventSearchComponent } from './shared/claim-care-shared/event-search/event-search.component';
import { ExitReasonDescriptionComponent } from './views/exit-reason-description/exit-reason-description.component';
import { ProcessStpMessagesComponent } from './views/process-stp-messages/process-stp-messages.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';
import { HolisticClaimViewComponent } from './shared/claim-care-shared/claim-holistic-view/holistic-claim-view-start-point/holistic-claim-view.component';
import { HolisticEventComponent } from './shared/claim-care-shared/claim-holistic-view/holistic-event/holistic-event.component';
import { CoidDashboardComponent } from './views/dashboards/coid-dashboard/coid-dashboard.component';
import { ClaimWorkpoolComponent } from './views/work-pools/claim-workpool/claim-workpool.component';
import { WorkPoolContainerComponent } from './views/work-pools/work-pool-container/work-pool-container.component';
import { ClaimsPaymentRecallComponent } from './views/claims-payment-recall/claims-payment-recall.component';
import { ClaimLayoutComponent } from './views/claim-layout/claim-layout.component';


const routes: Routes = [
  {
    path: '', component: ClaimLayoutComponent, 
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Claim manager view'] },
    children: [
      { path: '', component: ClaimHomeComponent, data: { title: 'Claim Manager' } },
      { path: 'claim-manager', component: ClaimHomeComponent },
      { path: 'event-manager/event', component: EventCaseHomeComponent },
      { path: 'claim-dashboard', component: ClaimDashboardComponent },
      { path: 'claim-view/:personEventId/:policyId', component: ClaimViewComponent },
      { path: 'search', component: LandingSearchComponent },
      { path: 'add-funeral', component: RegisterFuneralClaimComponent },
      { path: 'search-claim-member/:eventTypeId', component: ClaimMemberSearchComponent },
      { path: 'funeral/register/:insuredLifeId/:id', component: RegisterFuneralComponent },
      { path: 'funeral/register/:insuredLifeId/:deathTypeId/:id', component: RegisterFuneralComponent },
      { path: 'funeral/register/:id/:isreadonly/:wizardId/:insuredLifeId', component: RegisterFuneralComponent },
      { path: 'funeral/body-collection', component: BodyCollectionComponent },
      { path: 'funeral/forensic-pathologist', component: ForensicPathologistComponent },
      { path: 'funeral/informant', component: InformantComponent },
      { path: 'funeral/medical-practitioner', component: MedicalPractitionerComponent },
      { path: 'funeral/funeral-parlor', component: FuneralParlorComponent },
      { path: 'funeral/undertaker', component: UndertakerComponent },
      { path: 'funeral/claims-document/:id', component: ClaimsDocumentsComponent },
      { path: 'funeral/reverse-claim-payment/:id/:benId/:banId', component: ReverseClaimPaymentComponent },
      { path: 'funeral/beneficiary-banking-details', component: BeneficiaryBankingDetailsComponent },
      { path: 'funeral/claim-payment/:id/:benId/:banId', component: ClaimPaymentComponent },
      { path: 'funeral/claims-beneficiary-banking-detail/:id/:wizardId', component: ClaimsBeneficiaryBankingDetailComponent },
      { path: 'register-funeral/:action/:type/:linkedId', component: WizardHostComponent },
      { path: 'register-funeral/:id', component: WizardDetailsComponent },
      { path: 'funeral/add-beneficiary-banking-details/:id', component: AddBeneficiaryBankingDetailsComponent },
      { path: 'funeral/migrated-claim/:claimId/:insuredLifeId/:policyId', component: MigratedClaimComponent },
      { path: 'claim-notes/:claimId/:personEventId/:workpoolId', component: ClaimNotesComponent },
      { path: 'funeral/decline-claim/:id', component: DeclineClaimComponent },
      { path: 'funeral/cancel-claim/:id/:personEventId/:policyId', component: CancelClaimComponent },
      { path: 'claim-policy-detail/:id', component: ClaimsPolicyDetailComponent },
      { path: 'funeral/close-claim/:id/:personEventId/:policyId', component: CloseClaimComponent },
      { path: 'funeral/reopen-claim/:id/:personEventId/:policyId', component: ReOpenClaimComponent },
      { path: 'funeral/reverse-claim-payment/:id/:benId/:banId', component: ReverseClaimPaymentComponent },
      { path: 'funeral/claim-repay/:id', component: ClaimRepayComponent },
      { path: 'claim-workpool', component: ClaimWorkpoolComponent },
      { path: 'employer-work-pool', component: WorkPoolContainerComponent },
      { path: 'event-manager/event/event-details/:id', component: EventDetailsComponent },
      { path: 'event-manager/event/search-event', component: SearchEventComponent },
      { path: 'holistic-claim-view/:eventId', component: HolisticClaimViewComponent },
      { path: 'holistic-claim-view/:eventId/:personEventId', component: HolisticClaimViewComponent },
      { path: 'holistic-event/:personEventId', component: HolisticEventComponent },
      { path: 'manage-event/:action/:type/:linkedId', component: WizardHostComponent },
      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
      { path: 'manage-claim', component: ManageClaimComponent },
      { path: 'add-member', component: AddMemberStillbornComponent },
      { path: 'add-stillBorn', component: AddMemberStillbornComponent },
      { path: 'funeral/claim-details', component: FuneralClaimDetailsComponent },
      { path: 'funeral/claim-recovery/:id/:benId/:banId', component: ClaimRecoveryComponent },
      { path: 'person-event-search', component: PersonEventSearchComponent },
      { path: 'event-search', component: EventSearchComponent },
      { path: 'claim-notification-medical-view/:personEventId', component: ClaimNotificationMedicalViewComponent },
      { path: 'coid-dashboard', component: CoidDashboardComponent },
      { path: 'exit-reason-description/:exitReasonId', component: ExitReasonDescriptionComponent },
      { path: 'compcare-stp-messages', component: ProcessStpMessagesComponent },
      { path: ':type/:action/:linkedId', component: WizardHostComponent },
      { path: 'claims-payment-recall', component: ClaimsPaymentRecallComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ClaimManagerRoutingModule { }

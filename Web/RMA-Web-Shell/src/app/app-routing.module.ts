import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SignInGuard } from "projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard";
import { SignInComponent } from "./views/sign-in/sign-in.component";
import { HostComponent } from "./layout/host/host.component";
import { DashboardComponent } from "./views/dashboard/dashboard.component";
import { AuthFailureComponent } from "./views/auth-failure/auth-failure.component";
import { ErrorComponent } from "./views/error/error.component";
import { NotFoundComponent } from "./views/not-found/not-found.component";

// Do not remove these comented out items the code will not compile
import { WizardModule } from "projects/shared-components-lib/src/lib/wizard/wizard.module";
import { RulesEngineModule } from "projects/shared-components-lib/src/lib/rules-engine/rules-engine.module";
import { UserManagerModule } from "projects/admin/src/app/user-manager/user-manager.module";
import { CampaignManagerModule } from "projects/admin/src/app/campaign-manager/campaign-manager.module";
import { ConfigManagerModule } from "projects/admin/src/app/configuration-manager/config-manager.module";

import { ClientCareAppModule } from "projects/clientcare/src/app/app.module";
import { ClaimCareAppModule } from "projects/claimcare/src/app/app.module";
import { FinCareAppModule } from "projects/fincare/src/app/app.module";
import { ForgotPasswordComponent } from "./views/forgot-password/Forgot-password.component";
import { ResetPasswordComponent } from "./views/reset-password/reset-password.component";
import { MembershipDocsComponent } from "./views/membership-docs/membership-docs.component";
import { DigiCareMainAppModule } from "projects/digicare/src/app/app.module";
import { MediCareMainAppModule } from "projects/medicare/src/app/app.module";
import { PensCareMainAppModule } from "projects/penscare/src/app/app.module";
import { MemberMainAppModule } from "projects/member/src/app/app.module";
import { LegalCareMainAppModule } from "projects/legalcare/src/app/app.module";
import { DebtCareMainAppModule } from "projects/debtcare/src/app/app.module";
import { MarketingCareMainAppModule } from "projects/marketingcare/src/app/app.module";
import { ContactMainAppModule } from "projects/contactcare/src/app/app.module"
import { HcpMainAppModule } from "projects/hcp/src/app/app.module";

import { AnnouncementComponent } from "./views/announcement/announcement.component";
import { AnnouncementGuard } from "projects/shared-services-lib/src/lib/guards/announcements/announcement.guard";
import { FeatureFlagGuard } from "projects/shared-services-lib/src/lib/guards/featureflag/featureflag.guard";

const routes: Routes = [
  { path: "sign-in", component: SignInComponent },
  {
    path: "announcements",
    component: AnnouncementComponent,
    canActivate: [SignInGuard],
  },
  { path: "forgot-password", component: ForgotPasswordComponent },
  { path: "reset-password", component: ResetPasswordComponent },
  { path: "member-documents", component: MembershipDocsComponent },
  {
    path: "member",
    canActivate: [SignInGuard],
    children: [],
  },
  {
    path: "",
    component: HostComponent,
    canActivate: [SignInGuard, AnnouncementGuard],
    canActivateChild: [AnnouncementGuard],
    children: [
      { path: "dashboard", component: DashboardComponent },
      { path: "access-denied", component: AuthFailureComponent },
      { path: "access-denied/:message", component: AuthFailureComponent },
      { path: "error", component: ErrorComponent },

      // Shared
      {
        path: "wizard-manager",
        loadChildren: () =>
          import(
            "projects/shared-components-lib/src/lib/wizard/wizard.module"
          ).then((m) => m.WizardModule),
      },
      {
        path: "rules-engine",
        loadChildren: () =>
          import(
            "projects/shared-components-lib/src/lib/rules-engine/rules-engine.module"
          ).then((m) => m.RulesEngineModule),
      },

      // Admin
      {
        path: "user-manager",
        loadChildren: () =>
          import(
            "projects/admin/src/app/user-manager/user-manager.module"
          ).then((m) => m.UserManagerModule),
      },
      {
        path: "campaign-manager",
        loadChildren: () =>
          import(
            "projects/admin/src/app/campaign-manager/campaign-manager.module"
          ).then((m) => m.CampaignManagerModule),
      },
      {
        path: "config-manager",
        loadChildren: () =>
          import(
            "projects/admin/src/app/configuration-manager/config-manager.module"
          ).then((m) => m.ConfigManagerModule),
      },

      {
        path: "clientcare",
        loadChildren: () =>
          import("projects/clientcare/src/app/app.module").then(
            (m) => m.ClientCareAppModule
          ),
      },
      {
        path: "claimcare",
        loadChildren: () =>
          import("projects/claimcare/src/app/app.module").then(
            (m) => m.ClaimCareAppModule
          ),
      },
      {
        path: "fincare",
        loadChildren: () =>
          import("projects/fincare/src/app/app.module").then(
            (m) => m.FinCareAppModule
          ),
      },
      {
        path: "digicare",
        loadChildren: () =>
          import("projects/digicare/src/app/app.module").then(
            (m) => m.DigiCareMainAppModule
          ),
      },
      {
        path: "medicare",
        canLoad: [FeatureFlagGuard],
        data: { featureFlag: 'Disable_COID_VAPS_E2E_MediCare' },
        loadChildren: () =>
          import("projects/medicare/src/app/app.module").then(
            (m) => m.MediCareMainAppModule
          ),
      },
      {
        path: "penscare",
        canLoad: [FeatureFlagGuard],
        data: { featureFlag: 'Disable_COID_VAPS_E2E_PensCare' },
        loadChildren: () =>
          import("projects/penscare/src/app/app.module").then(
            (m) => m.PensCareMainAppModule
          ),
      },
      {
        path: "member",
        loadChildren: () =>
          import("projects/member/src/app/app.module").then(
            (m) => m.MemberMainAppModule
          ),
      },
      {
        path: "legalcare",
        canLoad: [FeatureFlagGuard],
        data: { featureFlag: 'Disable_COID_VAPS_E2E_LegalCare' },
        loadChildren: () =>
          import("projects/legalcare/src/app/app.module").then(
            (m) => m.LegalCareMainAppModule
          ),
      },
      {
        path: "debtcare",
        canLoad: [FeatureFlagGuard],
        data: { featureFlag: 'Disable_COID_VAPS_E2E_DebtCare' },
        loadChildren: () =>
          import("projects/debtcare/src/app/app.module").then(
            (m) => m.DebtCareMainAppModule
          ),
      },
      {
        path: "marketingcare",
        canLoad: [FeatureFlagGuard],
        data: { featureFlag: 'Disable_COID_VAPS_E2E_MarketingCare' },
        loadChildren: () =>
          import("projects/marketingcare/src/app/app.module").then(
            (m) => m.MarketingCareMainAppModule
          ),
      },
      {
        path: "contactcare",
        loadChildren: () =>
          import("projects/contactcare/src/app/app.module").then(
            (m) => m.ContactMainAppModule
          ),
      },
      {
        path: "hcp",
        loadChildren: () =>
          import("projects/hcp/src/app/app.module").then(
            (m) => m.HcpMainAppModule
          ),
      },

    ],
  }
  ,
  // {
  //   path: "**",
  //   component: HostComponent,
  //   canActivate: [SignInGuard],
  //   children: [{ path: "", component: NotFoundComponent }],
  // },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: "enabled",
    }),
  ], // , { useHash: true }
  exports: [RouterModule],
})
export class AppRoutingModule { }

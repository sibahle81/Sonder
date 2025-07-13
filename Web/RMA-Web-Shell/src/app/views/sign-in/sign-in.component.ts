import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";

import { User } from "projects/shared-models-lib/src/lib/security/user";
import { AlertService } from "projects/shared-services-lib/src/lib/services/alert/alert.service";
import { AppEventsManager } from "projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager";
import { AuthService } from "projects/shared-services-lib/src/lib/services/security/auth/auth.service";
import { UserService } from "projects/shared-services-lib/src/lib/services/security/user/user.service";
import { ValidateEmail } from "projects/shared-utilities-lib/src/lib/validators/email.validator";
import { UserPreferences } from "projects/shared-models-lib/src/lib/security/user-preferences";
import { isUndefined } from "util";
import { AnnouncementService } from "projects/shared-services-lib/src/lib/services/announcement/announcement.service";
import { PortalTypeEnum } from "projects/shared-models-lib/src/lib/enums/portal-type-enum";
import { PermissionHelper } from "projects/shared-models-lib/src/lib/common/permission-helper";
import { FeatureflagUtility } from "projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility";

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.css"],
})
export class SignInComponent extends PermissionHelper implements OnInit {
  loginForm: UntypedFormGroup;
  returnUrl: string;
  hide = true;
  backgroundImage = "";
  isIE = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);

  disable_coid_vaps_e2e_medicare:boolean = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_MediCare');
  disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClientCare');
  disable_coid_vaps_e2e_penscare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_PensCare');
  disable_coid_vaps_e2e_legalcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_LegalCare');
  disable_coid_vaps_e2e_debtcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_DebtCare');
  disable_coid_vaps_e2e_contactcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ContactCare');
  disable_coid_vaps_e2e_marketingcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_MarketingCare');

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly announcementService: AnnouncementService
  ) {
    super();
    this.createForm();
  }

  ngOnInit() {
    this.authService.logout();
    this.appEventsManager.setLoggedInUser(null);
    this.returnUrl = this.getReturnOrDefaultUrl();

    const random = Math.floor(Math.random() * 11);
    this.backgroundImage = `/assets/images/landingpage${random}.jpg`;
  }

  createForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ["", [ValidateEmail, Validators.required]],
      password: ["", Validators.required],
    });
  }

  readForm(): User {
    const user = new User();
    user.email = this.loginForm.value.email as string;
    user.password = this.loginForm.value.password as string;
    return user;
  }

  getReturnOrDefaultUrl(): string {
    return this.route.snapshot.queryParams.returnUrl || "/";
  }

  getTenant(): void {
    this.userService
      .getTenant(this.loginForm.value.email)
      .subscribe((tenant) => {
        this.appEventsManager.changeTenant(tenant);
      });
  }

  login(): void {
    if (this.loginForm.valid) {
      this.loginForm.disable();
      this.alertService.loading("Signing in...");
      const formUser = this.readForm();

      this.authService.profile$.subscribe(
        (profile) => {
          this.alertService.clear();
          if (profile !== null) {
            const user = this.authService.getCurrentUser();

            if (profile.portalTypeId == PortalTypeEnum.Broker) {
              this.alertService.error(
                "Access Denied: Please Login From Broker Portal"
              );
              return;
            }

            if (!isUndefined(profile.preferences)) {
              let userPreferences = JSON.parse(
                profile.preferences
              ) as UserPreferences;
              if (!userPreferences) {
                userPreferences = new UserPreferences();
              }
              this.appEventsManager.setUserPreferences(userPreferences);
            }

            this.appEventsManager.setLoggedInUser(user);
            this.getTenant();

            const navigateRoute = this.getPostLoginRoute(user);

            this.announcementService
              .getAnnouncementCountForUserId(user.id)
              .subscribe((announcementCount) => {
                if (announcementCount <= 0) {
                  this.router.navigate([navigateRoute]);
                  return;
                }

                this.router.navigate(["/announcements"], {
                  state: { data: navigateRoute },
                });
              });
          } else {
            this.loginForm.enable();
          }
        },
        () => this.error("Login Failed: Username or password is incorrect")
      );

      this.authService
        .login({ username: formUser.email, password: formUser.password })
        .subscribe(
          () => {
            this.alertService.clear();
          },
          () => this.error("Login Failed: Username or password is incorrect")
        );
    }
  }

  register(): void {
    window.location.href = `${this.initializeVariables()}/user-registration`;
  }

  registerHCP(): void {
    window.location.href = `${this.initializeVariables()}/external-user-registration`;
  }

  forgetPassword(): void {
    window.location.href = `${this.initializeVariables()}/forgot-password`;
  }

  private initializeVariables(): string {
    const host = window.location.protocol + "//" + window.location.host;

    if (host.includes("localhost")) {
      return;
    } else if (host.includes("dev")) {
      return "https://dev-memberportal.randmutual.co.za";
    } else if (host.includes("test")) {
      return "https://stest-memberportal.randmutual.co.za";
    } else if (host.includes("uat")) {
      return `https://uat-memberportal.randmutual.co.za`;
    } else {
      return "https://memberportal.randmutual.co.za";
    }
  }

  private getPostLoginRoute(user: User): string {
    if (this.userHasPermission('Default Admin Landing Page')) {
      return "/user-manager";
    }

    if (this.userHasPermission('Default ClientCare Landing Page')) {
      return "/clientcare/member-manager";
    }

    if (this.userHasPermission('Default ClaimCare Landing Page')) {
      return "/claimcare/claim-manager/employer-work-pool";
    }

    if (this.userHasPermission('Default ContactCare Landing Page')) {
      return "/contactcare/case-manager";
    }

    if (this.userHasPermission('Default FinCare Landing Page')) {
      return "/fincare";
    }

    if (this.userHasPermission('Default PensCare Landing Page') && !this.disable_coid_vaps_e2e_penscare) {
      return "/penscare";
    }

    if (this.userHasPermission('Default MediCare Landing Page') && !this.disable_coid_vaps_e2e_medicare) {
      return "/medicare";
    }

    if (this.userHasPermission('Default DigiCare Landing Page')) {
      return "/digicare/work-manager";
    }

    if (this.userHasPermission('Default ContactCare Landing Page') && !this.disable_coid_vaps_e2e_contactcare) {
      return "/contactcare";
    }

    if (this.userHasPermission('Default Member Portal Landing Page') && !this.disable_coid_vaps_e2e_clientcare) {
      return "/member/member-manager";
    }

    if (this.userHasPermission('Default DebtCare Landing Page') && !this.disable_coid_vaps_e2e_debtcare) {
      return "/debtcare";
    }

    if (this.userHasPermission('Default LegalCare Landing Page') && !this.disable_coid_vaps_e2e_legalcare) {
      return "/legalcare";
    }

    if (this.userHasPermission('Default MarketingCare Landing Page') && !this.disable_coid_vaps_e2e_marketingcare) {
      return "/marketingcare";
    }

    if (this.userHasPermission('Default HCP Portal Landing Page')) {
      return "/hcp/hcp-manager";
    }

    return "/clientcare/policy-manager";
  }

  private error(message: any): void {
    this.alertService.clear();
    this.alertService.error(message);
    this.loginForm.enable();
  }
}

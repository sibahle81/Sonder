// wiki: http://bit.ly/2B2EQcO
// The left menu is the main navigation for the site.

import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserPreferences } from 'projects/shared-models-lib/src/lib/security/user-preferences';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { MenuItem } from 'projects/shared-models-lib/src/lib/menu/menuitem';
import { MenuService } from 'projects/shared-services-lib/src/lib/services/menu/menu.service';
import { UserPreferenceService } from 'projects/shared-services-lib/src/lib/services/userpreferenceservice/userpreferenceservice.service';
import { MenuGroup } from 'projects/shared-models-lib/src/lib/menu/menugroup';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { TenantPreferences } from 'projects/shared-models-lib/src/lib/security/tenant-preferences';
import { TenantPreferenceService } from 'projects/shared-services-lib/src/lib/services/tenant-preference/tenant-preference.service';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

/** @description The left menu is the main navigation for the site. */
@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.css']
})
export class LeftMenuComponent implements OnInit {
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;
  user: User;
  menuGroups: MenuGroup[];
  step: string;
  navigationOpen = true;

  rmaLogo = '/assets/images/logo.png';
  isError = false;
  title = '';
  userPreference: UserPreferences;
  tenantPreference: TenantPreferences;
  userTenant: string;
  tenantId: number;
  tenantPreferenceLogo = FeatureflagUtility.isFeatureFlagEnabled('tenantPreferenceLogo');

  disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClientCare');
  disable_coid_vaps_e2e_claimcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClaimCare');
  disable_coid_vaps_e2e_fincare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_FinCare');
  disable_coid_vaps_e2e_medicare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_MediCare');
  disable_coid_vaps_e2e_penscare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_PensCare');
  disable_coid_vaps_e2e_legalcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_LegalCare');
  disable_coid_vaps_e2e_debtcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_DebtCare');
  disable_coid_vaps_e2e_contactcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ContactCare');
  disable_coid_vaps_e2e_marketingcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_MarketingCare');

  constructor(
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly appEventsManager: AppEventsManager,
    private readonly menuService: MenuService,
    private readonly authService: AuthService,
    private readonly userPreferenceservice: UserPreferenceService,
    private readonly userService: UserService,
    private readonly tenantPreferenceService: TenantPreferenceService
  ) {
    this.loadUserPreferences();
    if (this.tenantPreferenceLogo) {
      this.loadTenantPreferences();
    }
  }

  ngOnInit(): void {
    this.subscribeToLoginChanged();
    this.subscribeToMenuStateChanged();
    this.subscribeToPreferencesChanged();
    this.getCurrentTenant();

    this.menuService.GetMenuGroups()
      .subscribe(menuGroups => {
        this.handleMenuFeatureFlag(menuGroups);
      },
        error => {
          this.isError = true;
          this.showErrorMessage(error);
        });
  }

  handleMenuFeatureFlag(menuGroups: MenuGroup[]) {
    let hiddenMenuGroupTitles = []; // remove listed menu groups when Disable_COID_VAPS_E2E feature flag is enabled
    let hiddenMenuGroupMenuItemTitles = []; // remove listed sub menu items when Disable_COID_VAPS_E2E feature flag is enabled

    if (this.disable_coid_vaps_e2e_clientcare) {
      hiddenMenuGroupTitles.push('Member');
      hiddenMenuGroupMenuItemTitles.push('Lead Manager', 'Quote Manager');
    }

    if (this.disable_coid_vaps_e2e_claimcare) {
      hiddenMenuGroupMenuItemTitles.push('COID Dashboard', 'Claim Work Pool');
    }

    if (this.disable_coid_vaps_e2e_fincare) {
      // Nothing TODO
    }

    if (this.disable_coid_vaps_e2e_medicare) {
      hiddenMenuGroupTitles.push('MediCare');
    }

    if (this.disable_coid_vaps_e2e_penscare) {
      hiddenMenuGroupTitles.push('PensCare');
    }

    if (this.disable_coid_vaps_e2e_legalcare) {
      hiddenMenuGroupTitles.push('LegalCare');
    }

    if (this.disable_coid_vaps_e2e_debtcare) {
      hiddenMenuGroupTitles.push('DebtCare');
    }

    if (this.disable_coid_vaps_e2e_contactcare) {
      hiddenMenuGroupTitles.push('ContactCare');
    }

    if (this.disable_coid_vaps_e2e_marketingcare) {
      hiddenMenuGroupTitles.push('MarketingCare');
    }

    menuGroups = menuGroups.filter(s => !hiddenMenuGroupTitles.includes(s.title));

    menuGroups.forEach(menuGroup => {
      menuGroup.menuItems = menuGroup.menuItems.filter(t => !hiddenMenuGroupMenuItemTitles.includes(t.title));
    });

    this.menuGroups = menuGroups;
  }

  /** @description Listens for if a user login status changes. */
  subscribeToLoginChanged() {
    this.appEventsManager.loggedInUserChanged.subscribe(user => {
      this.user = user;
    });
  }

  /** @description Listens for if a user preferences have changed. */
  subscribeToPreferencesChanged() {
    this.appEventsManager.onUserPreferenceChanged.subscribe(userPreference => {
      if (userPreference) {
        this.userPreference = userPreference;
        if (userPreference.profileImageURL) {
          this.rmaLogo = userPreference.profileImageURL;
        }
        if (userPreference.landingPageURL) {
          const landingPageApplied = sessionStorage.getItem("landing-page-applied");
          if (landingPageApplied != 'true') {
            sessionStorage.setItem("landing-page-applied", 'true');
            this.router.navigateByUrl(userPreference.landingPageURL);
          }
        }
      }
    });
  }

  /**
   * @description Gets the multi select control by name.
   * @param string title The name of the current menu group that is open.
   */
  setStep(title: string) {
    this.step = title;
  }

  /** @description Toggles the menu to open or closed. */
  toggleNavigation(): void {
    this.navigationOpen = !this.navigationOpen;
    this.appEventsManager.onMenuStateChange(this.navigationOpen);
  }

  /** @description Listens for other components that could toggle the menu to open or closed. */
  subscribeToMenuStateChanged() {
    this.appEventsManager.menuStateChanged.subscribe(navigationOpen => {
      this.navigationOpen = navigationOpen;
    });
  }

  /**
   * @description Navigates to the selected url.
   * @param string menuItem The menu model that was clicked.
   */
  navigate(menuItem: MenuItem): void {
    if (!menuItem.isActive) { return; }
    this.router.navigate([menuItem.url]);
  }

  /**
   * @description Shows an error message to the user.
   * @param any error The error message that was thrown from the service.
   */
  showErrorMessage(error: any): void {
    const message = `Menu: ${error.message}`;
    this.alertService.error(message);
  }

  /**
   * @description Logs the current user out of the system, and redirects to the login page.
   */
  logout(): void {
    this.appEventsManager.setLoggedInUser(null);
    this.authService.logout();
    this.router.navigate(['sign-in']);
  }

  openUploadControl(): void {
    this.fileInput.nativeElement.click();
  }

  dragEnter(item: any): void {
    item.stopPropagation();
    item.preventDefault();
  }

  dragOver(item: any): void {
    item.stopPropagation();
    item.preventDefault();
  }

  dragDrop(item: any) {
    item.stopPropagation();
    item.preventDefault();
  }

  profilePictureChange($event: any): void {
    const file = $event.srcElement.files[0];
    if (file && this.validateFileType(file)) {
      const reader = new FileReader();
      reader.onload = () => {
        this.userPreference.profileImageURL = reader.result;
        this.userPreferenceservice.saveUserPreferances(this.userPreference).subscribe(
          result => {
            this.appEventsManager.setUserPreferences(this.userPreference);
            this.appEventsManager.onTenantPreferenceChanged.subscribe(tenantPreference => {
              if (tenantPreference) {
                this.tenantPreference = tenantPreference;
                if (tenantPreference.profileImageURL) {
                  this.rmaLogo = tenantPreference.profileImageURL;
                }
              }
            });
          }
        );
      };
      reader.onerror = (error) => {
        this.alertService.error('Error uploading file.' + file.name);
      };
      reader.readAsDataURL(file);
    }
  }

  private validateFileType(file: any): boolean {
    const fileTypes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png'
    ];
    for (const fileType of fileTypes) {
      if (file.type === fileType) {
        return true;
      }
    }
    return false;
  }

  private loadUserPreferences(): void {
    const user = this.authService.getCurrentUser();
    if (!user) { return; }
    this.userPreferenceservice.getUserPreferences(user.id).subscribe(
      data => {
        let userPreferences = JSON.parse(data.preferences) as UserPreferences;
        if (!userPreferences) { userPreferences = new UserPreferences(); }
        this.appEventsManager.setUserPreferences(userPreferences);
      }
    );
  }

  getCurrentTenant(): void {
    this.userService.getTenant(this.authService.getCurrentUser().email).subscribe(
      tenant => {
        this.userTenant = tenant.name;
      }
    );
  }

  openNav(): void {
    document.getElementById('mySidenav').style.width = '250px';
    document.getElementById('main').style.marginLeft = '250px';
    document.body.style.backgroundColor = 'rgba(0,0,0,0.4)';
  }

  closeNav(): void {
    document.getElementById('mySidenav').style.width = '0';
    document.getElementById('main').style.marginLeft = '0';
    document.body.style.backgroundColor = 'white';
  }

  public currentYear(): number {
    return new Date().getFullYear();
  }

  // new changes
  profilePicChange($event: any): void {
    const file = $event.srcElement.files[0];
    if (file && this.validateFileType(file)) {
      const reader = new FileReader();
      reader.onload = () => {
        this.tenantPreference.profileImageURL = reader.result;
        this.tenantPreferenceService.saveTenantPreferances(this.tenantPreference, this.tenantId).subscribe();
        {
          this.appEventsManager.setTenantPreferences(this.tenantPreference);
          this.rmaLogo = reader.result.toString();
        }
      };
      reader.onerror = (error) => {
        this.alertService.error('Error uploading file.' + file.name);
      };
      reader.readAsDataURL(file);
    }
  }

  private loadTenantPreferences(): void {
    this.userService.getTenant(this.authService.getCurrentUser().email).subscribe(
      tenant => {
        this.userTenant = tenant.name;
        this.tenantId = tenant.id;
        this.tenantPreferenceService.getTenantPreferences(tenant.id).subscribe(
          data => {
            let tenantPreferences = JSON.parse(data.preferences) as TenantPreferences;
            if (!tenantPreferences) {
              tenantPreferences = new TenantPreferences();
            }
            this.appEventsManager.setTenantPreferences(tenantPreferences);
          }
        );
      }
    );
  }
}

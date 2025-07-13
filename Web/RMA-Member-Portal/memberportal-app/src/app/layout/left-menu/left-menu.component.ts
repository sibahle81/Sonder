// wiki: http://bit.ly/2B2EQcO
// The left menu is the main navigation for the site.

import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserPreferences } from 'projects/shared-models-lib/src/lib/security/user-preferences';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { MenuItem } from 'projects/shared-models-lib/src/lib/menu/menuitem';
import { MenuService } from 'projects/shared-services-lib/src/lib/services/menu/menu.service';
import { UserPreferenceService } from 'projects/shared-services-lib/src/lib/services/userpreferenceservice/userpreferenceservice.service';
import { MenuGroup } from 'projects/shared-models-lib/src/lib/menu/menugroup';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

/** @description The left menu is the main navigation for the site. */
@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.css']
})
export class LeftMenuComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  user: User;
  menuGroups: MenuGroup[];
  step: string;
  navigationOpen = true;
  profilePic = '/assets/images/profilepic.png';
  isError = false;
  title = '';
  userPreference: UserPreferences;


  constructor(
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly appEventsManager: AppEventsManager,
    private readonly menuService: MenuService,
    private readonly authService: AuthService,
    private readonly userPreferenceservice: UserPreferenceService
  ) {
    this.loadUserPreferences();
  }

  ngOnInit(): void {
    this.subscribeToLoginChanged();
    this.subscribeToMenuStateChanged();
    this.subscribeToPreferencesChanged();
    this.menuService.GetMenuGroups()
      .subscribe(menuGroups => {
        this.menuGroups = menuGroups;
        if (this.menuGroups.length > 0) {
          // this.step = this.menuGroups[0].title;
        }
      },
        error => {
          this.isError = true;
          this.showErrorMessage(error);
        });
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
          this.profilePic = userPreference.profileImageURL;
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

  proPicChange($event: any): void {
    const file = $event.srcElement.files[0];
    if (file && this.validateFileType(file)) {
      const reader = new FileReader();
      reader.onload = () => {
        this.userPreference.profileImageURL = reader.result;
        this.userPreferenceservice.saveUserPreferances(this.userPreference).subscribe(
          result => {
            this.appEventsManager.setUserPreferences(this.userPreference);
            this.profilePic = reader.result.toString();
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
}

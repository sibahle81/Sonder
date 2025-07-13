import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationStart, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { User } from 'oidc-client';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { ErrorComponent } from 'src/app/shared/components/error/error.component';
import { Error } from 'src/app/shared/models/error.model';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit, AfterViewInit {
  @ViewChild(ErrorComponent)

  errorComponent: ErrorComponent;
  error: Error;
  user: User;
  // lastToast: Toastr;
  logoUrl: string;
  navigationOpen = true;
  title = '';
  loadingModule: boolean;
  loadingMessage: string;
  doubleMenu = false;
  loaded = false;

  constructor(
    private readonly authService: AuthService,
    private readonly appEventsManager: AppEventsManager,
    vcr: ViewContainerRef,
    private readonly router: Router,
    // private readonly idleService: UserIdleService,
    private readonly dialog: MatDialog,
    appInsights: any) {
    appInsights.setAuthenticatedUserId(authService.getUserEmail());
  }

  ngOnInit() {
    this.subcribeToNavigationChanged();
    this.subcribeToLoadingModuleChanged();
    this.setLoginStatus();
    this.subscribeToLoginChanged();
    this.subscribeToMenuStateChanged();
    this.appEventsManager.onMenuStateChange(true);
    this.subscribeToLoadingMessageChanged();
    this.setupIdleHandler();
    this.loaded = true;
  }

  /**
   * Setup Idle Handler
   */
  setupIdleHandler(): void {
    // // Start watching when user idle is starting.
    // this.idleService.onTimerStart().subscribe((count: number) => {
    //     if (count === 1) {
    //         this.dialog.open(IdleDialogComponent, { data: {} });
    //     }
    // });

    // // Raise event from App Events
    // this.idleService.onTimeout().subscribe(() => this.appEventsManager.sessionTimeout(true));
  }

  ngAfterViewInit() {
    // TODO : COMMENTED THIS SUBSCRIPTION BECAUSE IT REDIRECTS TO A GENERIC ERROR PAGE
    // APPLICATION SHOULD BE USABLE AND ERRORS HANDLED IN INTERNAL COMPONENTS
    // ERRORS ARE STILL LOGGED SEE: Global-error-handler service
    // this.subscribeToErrorMessageChanged();
  }

  /** @description Gets the last login details and notifies the app of the login status. */
  setLoginStatus(): void {
    const user = this.authService.getCurrentUser();
    this.appEventsManager.setLoggedInUser(user);
  }

  /** @description Listens for any changes in the user login status. */
  subscribeToLoginChanged() {
    this.appEventsManager.loggedInUserChanged.subscribe(user => {
      // this.user = user;
      this.setIdleTimer(user != null);
    });
  }

  setIdleTimer(isOn: boolean): void {
    if (isOn) {
      // this.idleService.startWatching();
    } else {
      // this.idleService.stopWatching();
    }
  }

  /** @description Listens for any changes in the menu visibility. */
  subscribeToMenuStateChanged() {
    this.appEventsManager.menuStateChanged.subscribe(navigationOpen => {
      this.navigationOpen = navigationOpen;
    });
  }

  /** @description Listens for any changes in component loading. */
  subscribeToLoadingMessageChanged(): void {
    this.appEventsManager.loadingMessageChanged.subscribe(loadingMessage => {
      this.doubleMenu = true;
      setTimeout(() => { this.loadingMessage = loadingMessage; }, 1);
    }
    );
  }

  /** @description Listens for any errors. */
  subscribeToErrorMessageChanged(): void {
    this.appEventsManager.errorMessageChanged.subscribe(error => {
      setTimeout(() => {
        this.error = error;
        if (this.error != null) { this.errorComponent.showError(this.error); }
      }, 1);
    });
  }

  /** @description Listens for any navigation changes. */
  subcribeToNavigationChanged(): void {
    this.router.events.subscribe((route) => {
      if (route instanceof NavigationStart) {
        this.appEventsManager.loadingStop();
        this.appEventsManager.showError(null);
      }
    });
  }

  /** @description Listens for any loading of lazy modules. */
  subcribeToLoadingModuleChanged(): void {
    this.router.events.subscribe((route) => {
      if (route instanceof RouteConfigLoadStart) {
        if (!this.user) { return; }
        this.loadingModule = true;
      } else if (route instanceof RouteConfigLoadEnd) {
        this.loadingModule = false;
      }
    });
  }
}

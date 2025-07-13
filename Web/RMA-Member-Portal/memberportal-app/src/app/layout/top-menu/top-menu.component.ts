// wiki: http://bit.ly/2B9CDMw
// Holds the breadcrumb, notification icons, and global search.
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, animate, style } from '@angular/animations';
import { RightMenuComponent } from '../right-menu/right-menu.component';
import { UserPreferences } from 'src/app/core/models/security/user-preference.model';
import { User } from 'src/app/core/models/security/user.model';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { NotificationComponent } from 'src/app/shared/components/wizard/views/notification/notification.component';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { WizardService } from 'src/app/shared/services/wizard.service';
import { NotificationSharedComponent } from 'src/app/shared/components/notification/notification-shared.component';
export interface DialogData {
  wizardConfigIds: string;
  title: string;
}

/** @description Holds the breadcrumb, notification icons, and global search. */
@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('200ms ease-in', style({ transform: 'translateY(0%)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-100%)' }))
      ])
    ])
  ]
})

export class TopMenuComponent implements OnInit {
  user: User;
  userPreference: UserPreferences;
  defaultClientName: string;
  navigationOpen = true;
  roots: string[] = ['clientcare/lead-manager', 'clientcare/product-manager', 'clientcare/policy-manager', 'clientcare/client-manager', 'fincare/billing-manager'];
  numberOfTasks: number;
  numberOfNotifications: number;
  environmentColor = '#F1F2F2';
  environment = 'UNKNOWN';
  compCareURL = 'https://dev.randmutual.co.za';

  taskWizardConfigIds = '';
  notificationWizardConfigIds = '';


  constructor(
    private readonly appEventsManager: AppEventsManager,
    private readonly router: Router,
    private readonly wizardService: WizardService,
    public dialog: MatDialog,
    private readonly lookupService: LookupService) {

    this.lookupService.getItemByKey('Environment').subscribe(environment => {
      this.environment = environment ? environment : this.environment;
      this.setCompCareURL(environment);
    });

    this.lookupService.getItemByKey('EnvironmentColor').subscribe(color => {
      this.environmentColor = color ? color : this.environmentColor;
    });
  }

  taskDialog(): void {
    this.dialog.open(NotificationSharedComponent, {
      width: 'auto',
      height: 'auto',
      data: {
        wizardConfigIds: this.taskWizardConfigIds,
        title: 'My Tasks',
        type: 'tasks'
      }
    });
  }

  notificationDialog(): void {
    this.dialog.open(NotificationComponent, {
      width: 'auto',
      height: 'auto',
      data: {
        wizardConfigIds: this.notificationWizardConfigIds,
        title: 'My Notifications',
        type: 'notifications'
      }
    });
  }

  rightMenuDialog(): void {
    this.dialog.open(RightMenuComponent, {
    });
  }

  ngOnInit(): void {
    this.subscribeToMenuStateChanged();
    this.subscribeToUserLoginChange();
    this.subscribeToPreferencesChanged();
  }

  /** @description Opens or closes the menu. */
  toggleNavigation(): void {
    this.navigationOpen = !this.navigationOpen;
    this.appEventsManager.onMenuStateChange(this.navigationOpen);
  }

  /** @description Listens for other components that could toggle the menu to open or closed. */
  subscribeToMenuStateChanged(): void {
    this.appEventsManager.menuStateChanged.subscribe(navigationOpen => {
      this.navigationOpen = navigationOpen;
    });
  }

  /** @description Listens for if a user login status changes. */
  subscribeToUserLoginChange(): void {
    this.appEventsManager.loggedInUserChanged.subscribe((user) => {
      this.user = user;
    });
  }

  subscribeToPreferencesChanged(): void {
    this.appEventsManager.onUserPreferenceChanged.subscribe(preference => {
      this.userPreference = preference;
    });
  }

  get hasDefaultClientPreference(): boolean {
    return this.userPreference != null && this.userPreference.defaultClientId != null;
  }

  navigateToClient(): void {
    this.router.navigate(['clientcare/client-manager/client-details', this.userPreference.defaultClientId]);
  }

  setCompCareURL(env: string): void {
    // TO DO: GET these urls from Module settings per environment

    if (env.toLowerCase().includes('test')) {
      this.compCareURL = 'https://uat.randmutual.co.za';
    }

    if (env.toLowerCase().includes('uat')) {
      this.compCareURL = 'https://cate.randmutual.co.za';
    }

    if (env.toLowerCase().includes('prod')) {
      this.compCareURL = 'https://compcare.randmutual.co.za';
    }
  }
}

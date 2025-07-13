// wiki: http://bit.ly/2B9CDMw
// Holds the breadcrumb, notification icons, and global search.
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserPreferences } from 'projects/shared-models-lib/src/lib/security/user-preferences';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UserPreferenceService } from 'projects/shared-services-lib/src/lib/services/userpreferenceservice/userpreferenceservice.service';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';

/** @description Holds the breadcrumb, notification icons, and global search. */
@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css']
})

export class TopMenuComponent implements OnInit {
  user: User;
  userPreference: UserPreferences;

  constructor(
    private readonly appEventsManager: AppEventsManager,
    private readonly router: Router,
    public dialog: MatDialog,
    private readonly alertService: AlertService,
    private readonly userPreferenceservice: UserPreferenceService) {
  }

  ngOnInit(): void {
    this.subscribeToUserLoginChange();
    this.subscribeToPreferencesChanged();
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

  landingPageURLChanged() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `User Preference: Landing Page`,
        text: `Are you sure you want to set the current page (${this.router.url}) as your default landing page?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.setLandingPageURL();
      }
    });
  }

  setLandingPageURL() {
    this.userPreference.landingPageURL = this.router.url;
    this.userPreferenceservice.saveUserPreferances(this.userPreference).subscribe(result => {
      this.alertService.success('Landing page updated successfully...');
    });
  }
}

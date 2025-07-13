import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivateChild, ActivatedRoute } from '@angular/router';
import { AnnouncementService } from '../../services/announcement/announcement.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';

import { AuthService } from '../../services/security/auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WizardEntryGuard implements CanActivate {
  private user = this.authService.getCurrentUser();

  constructor(
    private router: Router,
    private authService: AuthService,
    private readonly announcementService: AnnouncementService,
    private readonly wizardService: WizardService
  ) { }

  wizardId: number;
  wizardType: string;
  wizardAction: string;
  wizardExist: boolean;

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (route.params.type == null) { throw new Error('Cannot start a wizard without a type parameter'); }
    if (route.params.action == null) { throw new Error('Cannot start a wizard without an action parameter'); }
    if (route.params.linkedId == null) { throw new Error('Cannot start a wizard without an id parameter'); }

    this.wizardAction = route.params.action;
    this.wizardType = route.params.type;
    this.wizardId = route.params.linkedId;

    // If the wizardId is less than zero, it is a new wizard and won't be found in the database
    if (this.wizardId < 0) { return true; }

    return this.wizardService.getWizardsByTypeAndId(this.wizardId, this.wizardType)
      .pipe(
        map(wizard => {
          if (wizard) {
            return true;
          } else {
            const url = state.url.substring(0, state.url.indexOf(this.wizardType) - 1);
            this.router.navigate([url])
            return false;
          }
        })
      );
  }
}

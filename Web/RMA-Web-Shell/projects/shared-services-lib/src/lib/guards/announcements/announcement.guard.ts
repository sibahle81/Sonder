import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivateChild } from '@angular/router';
import { AnnouncementService } from '../../services/announcement/announcement.service';

import { AuthService } from '../../services/security/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementGuard implements CanActivate, CanActivateChild {
  private user = this.authService.getCurrentUser();

  constructor(private router: Router, private authService: AuthService, private readonly announcementService: AnnouncementService,) {

  }

  canActivate(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const announcementCount = Number(sessionStorage.getItem('announcement-count'));

    if (announcementCount > 0) {
      this.router.navigate(['/announcements'], { state: { data: state.url.split('/')[1] } });
      return false;
    }

    return true;
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const announcementCount = Number(sessionStorage.getItem('announcement-count'));

    if (announcementCount > 0) {
      this.router.navigate(['/announcements'], { state: { data: state.url.split('/')[1] } });
      return false;
    }

    return true;
  }
}

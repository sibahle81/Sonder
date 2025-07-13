import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/security/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SignInGuard implements CanActivate {
  private previousUrl: string = '';

  constructor(private router: Router, private authService: AuthService) {
    /*this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = event.url;
      }
    });*/
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    const isAuthenticated = this.authService.isAuthenticated();

    if (!isAuthenticated) {
      this.router.navigate(['/sign-in'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    /*
    if (isAuthenticated && this.previousUrl === '') {
      this.router.navigate(['/access-denied', 'Direct access via URL is not permitted. Please use the application navigation.'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    */

    return true;
  }

  protected hasRequiredPermission(permissions: string[]): boolean {
    let result = true;
    const userPermissions = this.authService.getCurrentUserPermissions();
    if (userPermissions && userPermissions.length > 0) {
      if (permissions && permissions.length > 0) {
        permissions.forEach(p => {
          const userPermission = userPermissions.find(up => up.name === p);
          if (userPermission) {
            result = true;
            return;
          }
          result = false;
          return;
        });
      }
    } else {
      result = false;
    }
    return result;
  }

}

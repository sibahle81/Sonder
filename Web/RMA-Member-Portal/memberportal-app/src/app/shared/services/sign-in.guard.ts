import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SignInGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    const isAuthenticated = this.authService.isAuthenticated();

    if (!isAuthenticated) {
      this.router.navigate(['/sign-in'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const hasPermission = this.hasRequiredPermission(route.data.permissions);
    if (hasPermission === false || !hasPermission) {
      const message = `No permissions for ${route.data.permissions}`;
      this.router.navigate(['/access-denied', message], { queryParams: { returnUrl: state.url } });
      return false;
    }

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

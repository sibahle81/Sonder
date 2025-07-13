import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { UserManager, User, SignoutResponse } from 'oidc-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Permission } from '../models/security/permission';
import { AuthTokenModel } from '../models/security/auth-tokens-model';
import { ProfileModel } from '../models/security/profile-model';
import { UserDetails } from '../models/security/user-details.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import jwtDecode from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {
  private userManager: UserManager;
  private user: User;
  loginChangedSubject = new Subject<boolean>();
  userTokenSubject = new Subject<boolean>();

  public ssoissuer: string;
  private host: string;
  notificationChange$ = new BehaviorSubject<boolean>(false);

  public $loginChanged = this.loginChangedSubject.asObservable();
  public $userTokenChanged = this.userTokenSubject.asObservable();

  constructor(private httpClient: HttpClient, private router: Router) {
    this.initializeVariables();

    const stsSettings = {
      authority: `${this.ssoissuer}/auth`,
      client_id: environment.ssoclientid,
      redirect_uri: `${this.host}/signin-callback`,
      scope: environment.ssoscope,
      response_type: 'token',
      post_logout_redirect_uri: `${this.host}/signout-callback`,
      oidc: true,
      filterProtocolClaims: true,
      loadUserInfo: true,
      showDebugInformation: true,
      requestAccessToken: true,
      requireHttps: false
    };

    this.userManager = new UserManager(stsSettings);
    this.userManager.events.addAccessTokenExpired(() => {
      this.loginChangedSubject.next(false);
    });
  }

  changeNotifications(change: boolean) {
    if (change) {
      this.notificationChange$.next(true);
    }
  }

  public login(): Promise<void> {
    // Redirect to sign in page
    return this.userManager.signinRedirect();
  }

  public logout(): Promise<void> {
    return this.userManager.signoutRedirect();
  }

  public isLoggedIn(): Promise<boolean> {
    return this.userManager.getUser()
      .then(user => {
        const userCurrent = this.userLoggedIn(user);
        if (this.user !== user) {
          this.loginChangedSubject.next(userCurrent);
        }
        this.user = user;
        return userCurrent;
      });
  }

  public completeLogin(): Promise<ProfileModel> {
    return this.userManager.signinRedirectCallback().then(user => {
      this.user = user;
      this.getUserPermissions();
      this.loginChangedSubject.next(this.userLoggedIn(user));
      const profile: ProfileModel = jwtDecode(user.access_token);
      return profile;
    }).catch(error => {
      console.log(error);
      throw new Error(error);
    });
  }

  public completeLogout(): Promise<void> {
    sessionStorage.removeItem('auth-tokens');
    sessionStorage.removeItem('auth-profile');
    sessionStorage.removeItem('auth-permissions');

    this.user = null;
    this.userManager.removeUser();
    this.userManager.clearStaleState();
    return this.userManager.signoutRedirectCallback().then(() => {
      this.loginChangedSubject.next(null);
      this.router.navigate(['/'], { replaceUrl: true });
    });
  }

  getCurrentUserPermissions(): Permission[] {
    const permissionsString = sessionStorage.getItem('auth-permissions');
    const model: Permission[] = permissionsString == null ? null : JSON.parse(permissionsString);
    return model;
  }

  getUserPermissions(): Permission[] {
    const user: User = this.user;
    sessionStorage.setItem('auth-tokens', JSON.stringify(user.access_token));
    this.userTokenSubject.next(true);

    const profile: ProfileModel = jwtDecode(user.access_token);
    const now = new Date();
    user.expires_at = new Date(now.getTime() + profile.exp * 1000).getTime();
    const apiUrl = `${this.ssoissuer}/sec/api/permission/${profile.token}`;
    const headers = {
      headers: new HttpHeaders(
        {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json, text/plain, */*',
          'Access-Control-Allow-Origin': '*',
          Authorization: 'Bearer ' + user.access_token
        }
      )
    };

    this.httpClient.get<Permission[]>(apiUrl, headers).subscribe(
      permissions => {
        sessionStorage.setItem('auth-permissions', JSON.stringify(permissions));
      },
      (err => {
        console.log(err);
      })
    );

    const permissionsString = sessionStorage.getItem('auth-permissions');
    const model: Permission[] = permissionsString == null ? null : JSON.parse(permissionsString);
    return model;
  }

  getCurrentToken(): string {
    if (!this.user) {
      const reportUser = sessionStorage.getItem('reportviewer-user');
      const model: string = reportUser == null ? null : reportUser;
      return model
    }

    return this.user.access_token;
  }

  getUserEmail(): string {
    const profile = this.getCurrentUser();
    return profile.email;
  }

  public isAuthenticated = (): Promise<boolean> => {
    return this.userManager.getUser()
      .then(user => {
        if (this.user !== user) {
          this.loginChangedSubject.next(this.userLoggedIn(user));
        }
        this.user = user;

        return this.userLoggedIn(user);
      })
  }

  getCurrentUser(): UserDetails {
    const profileString = sessionStorage.getItem('auth-tokens');
    const profile: ProfileModel = profileString == null ? null : jwtDecode(profileString);

    if (profile === null) {
      return null;
    }

    const user = new UserDetails();
    user.id = Number(profile.sub);
    user.email = profile.email;
    user.name = profile.name;
    user.token = profile.token;
    user.userTypeId = profile.userTypeId;
    user.roleId = profile.roleId;
    user.roleName = profile.role;
    user.displayName = profile.name;
    user.preferences = profile.preferences;

    return user;
  }

  userLoggedIn(user): boolean {
    return user != null && !user.expired;
  }

  public clearState(): void {
    this.user = null;
    this.userManager.removeUser();

    this.userManager.clearStaleState().then(function () {
      console.log('clearStateState success');
    }).catch(function (e) {
      console.log('clearStateState error', e.message);
    });
  }

  private initializeVariables() {
    this.host = window.location.protocol + '//' + window.location.host;
    this.ssoissuer = environment.ssoissuer;
    // TO DO: GET these url's from Module settings per environment
    if (this.host.includes('rma.msft') || this.host.includes('localhost')) {
      return;
    }

    if (this.host.includes('dev')) {
      this.ssoissuer = `https://sfdev.randmutual.co.za`;
      return;
    }

    if (this.host.includes('test')) {
      this.ssoissuer = `https://sfstest.randmutual.co.za`;
      return;
    }

    if (this.host.includes('uat')) {
      this.ssoissuer = `https://sfuat.randmutual.co.za`;
      return;
    }
    this.ssoissuer = `https://sfprod.randmutual.co.za`;
  }

  getSingleSignOnIssuerAuthority(): string {
    this.initializeVariables();
    return this.ssoissuer;
  }

  userHasPermission(permissionName: string): boolean {
    const permissionsString = sessionStorage.getItem('auth-permissions');
    const model: Permission[] = permissionsString == null ? null : JSON.parse(permissionsString);

    if (!model) { return false; }

    const permission = model.find(x => x.name === permissionName);

    if (typeof permission === 'undefined') {
      return false;
    } else {
      return true;
    }
  }
}

import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  Observable,
  of,
  Subscription,
  BehaviorSubject,
  interval,
  throwError,
} from "rxjs";
import { RefreshGrantModel } from "projects/shared-models-lib/src/lib/security/refresh-grant-model";
import { ProfileModel } from "projects/shared-models-lib/src/lib/security/profile-model";
import { AuthStateModel } from "projects/shared-models-lib/src/lib/security/auth-state-model";
import { AuthTokenModel } from "projects/shared-models-lib/src/lib/security/auth-tokens-model";
import { LoginModel } from "projects/shared-models-lib/src/lib/security/login-model";
import * as jwtDecode from "jwt-decode";
import { filter, map, tap, catchError, first, flatMap } from "rxjs/operators";
import { User } from "projects/shared-models-lib/src/lib/security/user";
import { Permission } from "projects/shared-models-lib/src/lib/security/permission";
import { SLAItemTypeConfiguration } from "projects/shared-models-lib/src/lib/sla/sla-status-change-audit/sla-item-type-configuration";
import { PublicHoliday } from "projects/admin/src/app/configuration-manager/shared/public-holiday";
import { EncryptionUtility } from "projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility";


@Injectable({
  providedIn: "root",
})
export class AuthService {
  private initalState: AuthStateModel = {
    profile: null,
    tokens: null,
    authReady: false,
  };
  private state: BehaviorSubject<AuthStateModel>;
  private refreshSubscription$: Subscription;
  private apiUrl: string;

  state$: Observable<AuthStateModel>;
  tokens$: Observable<AuthTokenModel>;
  profile$: Observable<ProfileModel>;
  loggedIn$: Observable<boolean>;
  permissions$: Observable<Permission[]>;
  slaItemTypeConfiguration$: Observable<SLAItemTypeConfiguration[]>;

  constructor(private httpClient: HttpClient) {
    this.state = new BehaviorSubject<AuthStateModel>(this.initalState);
    this.state$ = this.state.asObservable();

    this.tokens$ = this.state.pipe(
      filter((state) => state.authReady),
      map((state) => state.tokens)
    );
    this.profile$ = this.state.pipe(
      filter((state) => state.authReady),
      map((state) => state.profile)
    );
    this.permissions$ = this.state$.pipe(
      filter((state) => state.authReady),
      map((state) => state.permissions)
    );

    this.loggedIn$ = this.tokens$.pipe(map((tokens) => !!tokens));

    const configEnv = environment.appUrl;

    if (configEnv === "") {
      this.apiUrl = window.location.protocol + "//" + window.location.host;
    } else {
      this.apiUrl = `${environment.appUrl}`;
    }
  }

  init(): Observable<AuthTokenModel> {
    return this.startupTokenRefresh().pipe(tap(() => this.scheduleRefresh()));
  }

  loginOld(user: User): Observable<any> {
    return this.login({ username: user.email, password: user.password });
  }

  login(user: LoginModel): Observable<any> {
    sessionStorage.removeItem("auth-tokens");
    sessionStorage.removeItem("auth-profile");
    sessionStorage.removeItem("auth-permissions");
    sessionStorage.removeItem("linked-user-context");
    sessionStorage.removeItem("user-context-ready");
    sessionStorage.removeItem("sla-configurations");
    sessionStorage.removeItem("public-holidays");
    sessionStorage.removeItem("landing-page-applied");
    sessionStorage.removeItem("enabled-feature-flags");

    return this.getTokens(user, "password").pipe(
      catchError((res) => throwError(res.json())),
      tap((res) => this.scheduleRefresh())
    );
  }

  logout(): void {
    sessionStorage.removeItem("auth-tokens");
    sessionStorage.removeItem("auth-profile");
    sessionStorage.removeItem("auth-permissions");
    sessionStorage.removeItem("linked-user-context");
    sessionStorage.removeItem("user-context-ready");
    sessionStorage.removeItem("sla-configurations");
    sessionStorage.removeItem("public-holidays");
    sessionStorage.removeItem("landing-page-applied");
    sessionStorage.removeItem("enabled-feature-flags");

    this.updateState({ profile: null, tokens: null, permissions: null });
    if (this.refreshSubscription$) {
      this.refreshSubscription$.unsubscribe();
    }
  }

  refreshTokens(): Observable<AuthTokenModel> {
    return this.state.pipe(
      first(),
      map((state) => state.tokens),
      flatMap((tokens) =>
        this.getTokens(
          { refresh_token: tokens ? tokens.refresh_token : null },
          "refresh_token"
        ).pipe(catchError(() => throwError("Session Expired")))
      )
    );
  }

  isAuthenticated(): boolean {
    const token = this.getCurrentTokens();
    const permissions = this.getCurrentUserPermissions();
    const profile = this.getCurrentUser();

    if (profile !== null && token !== null && permissions !== null) {
      if (+token.expiration_date < new Date().getTime()) {
        return false;
      }
      return true;
    }
    return false;
  }

  getCurrentUser(): User {
    const profileString = sessionStorage.getItem("auth-profile");
    const profile: ProfileModel =
      profileString == null ? null : JSON.parse(EncryptionUtility.decryptData(profileString));

    if (profile === null) {
      return null;
    }

    const user = new User();
    user.id = Number(profile.sub);
    user.email = profile.email;
    user.name = profile.name;
    user.token = profile.token;
    user.userTypeId = profile.userTypeId;
    user.roleId = profile.roleId;
    user.roleName = profile.role;
    user.displayName = profile.name;
    user.preferences = profile.preferences;
    user.portalType = profile.portalTypeId;
    user.isInternalUser = Boolean(
      JSON.parse(profile.isinternaluser.toLowerCase())
    );
    return user;
  }

  getCurrentTokens(): AuthTokenModel {
    const tokensString = sessionStorage.getItem("auth-tokens");
    const model: AuthTokenModel =
      tokensString == null ? null : JSON.parse(tokensString);
    return model;
  }

  getCurrentUserPermissions(): Permission[] {
    const permissionsString = sessionStorage.getItem("auth-permissions");
    const model: Permission[] =
      permissionsString == null ? null : JSON.parse(EncryptionUtility.decryptData(permissionsString));
    return model;
  }

  getUserEmail(): string {
    const profile = this.getCurrentUser();
    return profile.email;
  }

  private updateState(newState: AuthStateModel): void {
    const previousState = this.state.getValue();
    this.state.next(Object.assign({}, previousState, newState));
  }

  private getTokens(
    data: RefreshGrantModel | LoginModel,
    grantType: string
  ): Observable<AuthTokenModel> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/x-www-form-urlencoded",
      }),
    };

    Object.assign(data, {
      grant_type: grantType,
      scope: "openid offline_access",
    });

    const params = new URLSearchParams();
    Object.keys(data).forEach((key) => params.append(key, data[key]));

    return this.httpClient
      .post<AuthTokenModel>(
        `${this.apiUrl}/auth/connect/token`,
        params.toString(),
        httpOptions
      )
      .pipe(
        tap((tokens) => {
          const now = new Date();
          tokens.expiration_date = new Date(
            now.getTime() + tokens.expires_in * 1000
          )
            .getTime()
            .toString();

          const profile: ProfileModel = jwtDecode(tokens.id_token);

          const headers = {
            headers: new HttpHeaders({
              "Content-Type": "application/json; charset=utf-8",
              Authorization: "Bearer " + tokens.access_token,
            }),
          };

          const slaApiUrl = `${this.apiUrl}/mdm/api/sla/GetSLAItemTypeConfigurations`;
          this.httpClient.get<SLAItemTypeConfiguration[]>(slaApiUrl, headers).subscribe((slaConfigurations) => {
            sessionStorage.setItem("sla-configurations", JSON.stringify(slaConfigurations)
            );
          });

          const publicHolidayApiUrl = `${this.apiUrl}/mdm/api/PublicHoliday`;
          this.httpClient.get<PublicHoliday[]>(publicHolidayApiUrl, headers).subscribe((publicHolidays) => {
            sessionStorage.setItem("public-holidays", JSON.stringify(publicHolidays)
            );
          });

          const featurFlagApiUrl = `${this.apiUrl}/mdm/api/Configuration/GetAllActiveEnabledFeatureFlagKeys`;
          this.httpClient.get<string[]>(featurFlagApiUrl, headers).subscribe((enabledFeatureFlags) => {
            sessionStorage.setItem("enabled-feature-flags", JSON.stringify(enabledFeatureFlags)
            );
          });

          const apiUrl = `${this.apiUrl}/sec/api/permission/${profile.token}`;
          this.httpClient.get<Permission[]>(apiUrl, headers).subscribe((permissions) => {
            const previousState = this.state.getValue();
            if (
              previousState.tokens != null &&
              tokens.refresh_token == null
            ) {
              tokens.refresh_token = previousState.tokens.refresh_token;
            }

            sessionStorage.setItem("auth-tokens", JSON.stringify(tokens));
            sessionStorage.setItem("auth-profile", EncryptionUtility.encryptData(JSON.stringify(profile)));
            sessionStorage.setItem("auth-permissions", EncryptionUtility.encryptData(JSON.stringify(permissions))
            );

            this.updateState({
              authReady: true,
              tokens,
              profile,
              permissions,
            });
          });
        })
      );
  }

  private startupTokenRefresh(): Observable<AuthTokenModel> {
    const previousState = this.state.getValue();
    return of(previousState.tokens).pipe(
      flatMap((tokens: AuthTokenModel) => {
        if (!tokens) {
          this.updateState({ authReady: true });
          return throwError("No token in Storage");
        }
        const profile: ProfileModel = jwtDecode(tokens.id_token);
        this.updateState({ tokens, profile });

        if (+tokens.expiration_date > new Date().getTime()) {
          this.updateState({ authReady: true });
        }

        return this.refreshTokens();
      }),
      catchError((error) => {
        this.logout();
        this.updateState({ authReady: true });
        return throwError(error);
      })
    );
  }

  private scheduleRefresh(): void {
    this.refreshSubscription$ = this.tokens$
      .pipe(
        first(),
        // refresh every half the total expiration time
        flatMap((tokens) =>
          interval(((tokens ? tokens.expires_in : 0) / 2) * 1000)
        ),
        flatMap(() => this.refreshTokens())
      )
      .subscribe();
  }
}

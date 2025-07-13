import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../core/models/security/user.model';
import { Tenant } from '../../core/models/security/Tenant.model';
import { Breadcrumb } from '../../shared/models/Breadcrumb.model';
import { Error } from '../../shared/models/error.model';
import { UserPreferences } from '../../core/models/security/user-preference.model';


/** @description Provides communication between components in the app. */
@Injectable({
 providedIn: 'root'
})
export class AppEventsManager {
    private loggedInUser = new BehaviorSubject<User>(null);
    private currentTenant = new BehaviorSubject<Tenant>(null);
    private isMenuOpen = new BehaviorSubject<boolean>(null);
    private loadingMessage = new BehaviorSubject<string>(null);
    private errorMessage = new BehaviorSubject<Error>(null);
    private expiredUserSession = new BehaviorSubject<boolean>(null);
    private breadcrumbs = new BehaviorSubject<Breadcrumb[]>(null);
    private userPreferences = new BehaviorSubject<UserPreferences>(null);
    private currentClient = new BehaviorSubject<number>(null);

    constructor() {
    }

    /** @description Triggers when a user signs into the system. */
    loggedInUserChanged = this.loggedInUser.asObservable();

    /** @description Triggers when the current tennant changes. */
    currentTenantChanged = this.currentTenant.asObservable();

    /** @description Triggers when a opens or closes the left menu. */
    menuStateChanged = this.isMenuOpen.asObservable();

    /** @description Triggers when a new loading message is displayed. */
    loadingMessageChanged = this.loadingMessage.asObservable();

    /** @description Triggers when a new error message is displayed. */
    errorMessageChanged = this.errorMessage.asObservable();

    /** @description Triggers when the user session timesout. */
    onSessionTimeout = this.expiredUserSession.asObservable();

    /** @description Triggers when the breadcrumb changes. */
    onBreadcrumbsChanged = this.breadcrumbs.asObservable();

     /** @description Triggers when the currently selected client changes. */
     onCurrentClientChanged = this.currentClient.asObservable();

    /** @description Triggers when the preferences changes. */
    onUserPreferenceChanged = this.userPreferences.asObservable();

    /**
     * @description Set that the user login status changed.
     * @param User user The new user.
     */
    setLoggedInUser(user: User): void {
        this.loggedInUser.next(user);
    }

    /**
     * @description Set that the menu visibility changed.
     * @param boolean isOpen The new visibility of the menu.
     */
    onMenuStateChange(isOpen: boolean): void {
        this.isMenuOpen.next(isOpen);
    }

    /**
     * @description Set that the current tenant has changed.
     * @param Tenant tenant The tenant that was changed.
     */
    changeTenant(tenant: Tenant): void {
        this.currentTenant.next(tenant);
    }

    /**
     * @description Hiddes the current component and shows the loading component with a loading message.
     * @param string message The loading message that will be displayed.
     */
    loadingStart(message: string): void {
        this.loadingMessage.next(message);
    }

    /** @description Hiddes the loading component and shows the current component. */
    loadingStop(): void {
        this.loadingMessage.next(null);
    }

    /**
     * @description Hiddes the current component and shows the error component with an error message.
     * @param string message The error message that will be displayed.
     */
    showError(error: Error): void {
        this.errorMessage.next(error);
    }

    /**
     * @description This shows that the seesion has expired
     * @param boolean isTimedOut Shows that the session has timed out
     */
    sessionTimeout(isTimedOut: boolean): void {
        this.expiredUserSession.next(isTimedOut);
    }

    /**
     * @description Set the breadcrumb.
     * @param User user The new user.
     */
    setBreadcrumb(breadcrumbs: Breadcrumb[]): void {
        this.breadcrumbs.next(breadcrumbs);
    }

    /**
     * @description Set the user Preference.
     * @param preferences string Json string on the suer preferences
     */
    setUserPreferences(preferences: UserPreferences): void {
        this.userPreferences.next(preferences);
    }

    setCurrentClient(clientId: number): void {
        this.currentClient.next(clientId);
    }
}

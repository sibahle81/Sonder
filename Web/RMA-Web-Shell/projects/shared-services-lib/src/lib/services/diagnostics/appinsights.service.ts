import { Injectable } from '@angular/core';
import { AppInsights } from 'applicationinsights-js';
import { Router, ActivatedRouteSnapshot, ActivatedRoute, ResolveEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: "root"
})
export class AppInsightsService {
    public aiKey: string;
    private routerSubscription: Subscription;

    constructor(
        private router: Router) {

        if (!AppInsights.config) {
            const config: Microsoft.ApplicationInsights.IConfig = {
                instrumentationKey: this.aiKey
            };

            if (window.location.hostname === 'sfdev.randmutual.co.za') {
                config.instrumentationKey = '7fcf47fb-0942-4335-949f-715116aaabf5';
            } else if (window.location.hostname === 'sfstest.randmutual.co.za') {
                config.instrumentationKey = 'c8f94336-f316-43d5-be86-e90e33893c91';
            } else if (window.location.hostname === 'sfuat.randmutual.co.za') {
                config.instrumentationKey = '92feb9b4-5f45-40f4-8c71-c78b579487aa';
            } else if (window.location.hostname === 'sfcate.randmutual.co.za') {
                config.instrumentationKey = '2c3331f2-5508-4047-a530-e3af85c92bd6';
            } else if (window.location.hostname === 'gateway.randmutual.co.za') {
                config.instrumentationKey = '8820851c-20df-44f2-9cdd-68a3fca21f54';
            } else {
                config.instrumentationKey = '7fcf47fb-0942-4335-949f-715116aaabf5';
            }

            AppInsights.downloadAndSetup(config);
        }

        this.routerSubscription = this.router.events.pipe(filter(event => event instanceof ResolveEnd))
            .subscribe((event: ResolveEnd) => {
                const activatedComponent = this.getActivatedComponent(event.state.root);
                if (activatedComponent) {
                    this.logPageView(`${activatedComponent.name} ${this.getRouteTemplate(event.state.root)}`, event.urlAfterRedirects);
                }
            });
    }

    setAuthenticatedUserId(userId: string): void {
        AppInsights.setAuthenticatedUserContext(userId);
    }

    private getActivatedComponent(snapshot: ActivatedRouteSnapshot): any {

        if (snapshot.firstChild) {
            return this.getActivatedComponent(snapshot.firstChild);
        }

        return snapshot.component;
    }

    private getRouteTemplate(snapshot: ActivatedRouteSnapshot): string {
        let path = '';
        if (snapshot.routeConfig) {
            path += snapshot.routeConfig.path;
        }

        if (snapshot.firstChild) {
            return path + this.getRouteTemplate(snapshot.firstChild);
        }

        return path;
    }

    private AddGlobalProperties(properties?: { [key: string]: string }): { [key: string]: string } {
        if (!properties) {
            properties = {};
        }

        // add your custom properties such as app version

        return properties;
    }

    public logPageView(name: string, url?: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }, duration?: number) {
        AppInsights.trackPageView(name, url, this.AddGlobalProperties(properties), measurements, duration);
    }

    public logEvent(name: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }) {
        AppInsights.trackEvent(name, this.AddGlobalProperties(properties), measurements);
    }

    public logError(error: Error, properties?: { [key: string]: string }, measurements?: { [key: string]: number }) {
        AppInsights.trackException(error, null, this.AddGlobalProperties(properties), measurements);
    }
}

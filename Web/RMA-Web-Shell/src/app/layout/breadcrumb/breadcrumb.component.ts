import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Breadcrumb } from 'projects/shared-models-lib/src/lib/menu/breadcrumb';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'breadcrumb',
    templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent implements OnInit {
    breadcrumbs: Breadcrumb[];

    constructor(
        private readonly router: Router,
        private readonly appEventsManager: AppEventsManager) {
    }

    ngOnInit(): void {
        this.subscriveToRouterChanged();
        this.subscribeToBreadcrumbStateChanged();
    }

    subscriveToRouterChanged(): void {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.breadcrumbs = null;
            }
        });
    }

    subscribeToBreadcrumbStateChanged() {
        this.appEventsManager.onBreadcrumbsChanged.subscribe(breadcrumbs => {
            this.breadcrumbs = breadcrumbs;
        });
    }

    onSelect(breadcrumb: Breadcrumb): void {
        this.router.navigate([breadcrumb.url]);
    }
}

import { Injectable } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Breadcrumb } from 'projects/shared-models-lib/src/lib/menu/breadcrumb';


@Injectable()
export class UserManagerBreadcrumbService {

    constructor(private readonly appEventsManager: AppEventsManager) {
    }

    private createClientManagerBreadcrumb(): Breadcrumb {
        const breadcrumb = new Breadcrumb();
        breadcrumb.title = 'User Manager';
        breadcrumb.url = 'user-manager';
        return breadcrumb;
    }

    setBreadcrumb(title: string): void {
        const breadCrumbs = new Array<Breadcrumb>();
        breadCrumbs.push(this.createClientManagerBreadcrumb());

        const currentBreadcrumb = new Breadcrumb();
        currentBreadcrumb.title = title;
        breadCrumbs.push(currentBreadcrumb);

        this.appEventsManager.setBreadcrumb(breadCrumbs);
    }
}

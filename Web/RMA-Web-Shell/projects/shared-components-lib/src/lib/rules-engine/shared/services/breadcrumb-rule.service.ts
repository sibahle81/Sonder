import { Injectable } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Breadcrumb } from 'projects/shared-models-lib/src/lib/menu/breadcrumb';

@Injectable()
export class BreadcrumbRuleService {

    constructor(private readonly appEventsManager: AppEventsManager) {
    }

    setBreadcrumb(title: string): void {
        const breadCrumbs = new Array<Breadcrumb>();

        const rulesEngine = new Breadcrumb();
        rulesEngine.title = 'Rules Engine';
        rulesEngine.url = 'rules-engine';
        breadCrumbs.push(rulesEngine);

        const currentBreadcrumb = new Breadcrumb();
        currentBreadcrumb.title = title;
        breadCrumbs.push(currentBreadcrumb);

        this.appEventsManager.setBreadcrumb(breadCrumbs);
    }
}

import { Injectable } from '@angular/core';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { Breadcrumb } from 'src/app/shared/models/Breadcrumb.model';
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

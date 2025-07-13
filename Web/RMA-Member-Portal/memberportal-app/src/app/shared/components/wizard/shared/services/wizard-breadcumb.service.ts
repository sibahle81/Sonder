import { Injectable } from '@angular/core';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { Breadcrumb } from 'src/app/shared/models/Breadcrumb.model';
@Injectable()
export class WizardBreadcrumbService {

    constructor(
        private readonly appEventsManager: AppEventsManager) {
    }

    private createPolicyManagerBreadcrumb(module: string): Breadcrumb {
        const breadcrumb = new Breadcrumb();
        breadcrumb.title = module;
        breadcrumb.url = 'wizard-list';
        return breadcrumb;
    }

    setBreadcrumb(module: string, title: string): void {
        const breadcrumbs = new Array<Breadcrumb>();
        breadcrumbs.push(this.createPolicyManagerBreadcrumb(module));

        const currentBreadcrumb = new Breadcrumb();
        currentBreadcrumb.title = title;
        breadcrumbs.push(currentBreadcrumb);

        this.appEventsManager.setBreadcrumb(breadcrumbs);
    }
}

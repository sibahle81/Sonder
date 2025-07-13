import { Injectable } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Breadcrumb } from 'projects/shared-models-lib/src/lib/menu/breadcrumb';

@Injectable({
    providedIn: 'root'
})
export class BreadcrumbProductService {

    constructor(private readonly appEventsManager: AppEventsManager) {
    }

    setBreadcrumb(title: string): void {
        const breadCrumbs = new Array<Breadcrumb>();

        const productManager = new Breadcrumb();
        productManager.title = 'Product Manager';
        productManager.url = 'product-manager';
        breadCrumbs.push(productManager);

        const currentBreadcrumb = new Breadcrumb();
        currentBreadcrumb.title = title;
        breadCrumbs.push(currentBreadcrumb);

        this.appEventsManager.setBreadcrumb(breadCrumbs);
    }
}

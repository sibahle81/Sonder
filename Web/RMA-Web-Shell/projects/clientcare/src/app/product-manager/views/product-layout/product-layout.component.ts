import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

@Component({
    templateUrl: './product-layout.component.html'
})
export class ProductLayoutComponent extends ModuleMenuComponent implements OnInit, AfterContentChecked {
    canAddProduct: boolean;
    canAddBenefit: boolean;
    canAddProductOption: boolean;
    canViewProduct: boolean;
    canViewBenefit: boolean;
    canViewProductOption: boolean;

    canAddDiscountType: boolean;
    canViewDiscountType: boolean;

    get canUploadBenefits(): boolean {
        return FeatureflagUtility.isFeatureFlagEnabled('UploadBenefitOptions');
    }

    constructor(
        readonly router: Router,
        private readonly appEventsManager: AppEventsManager,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        super(router);
    }

    ngOnInit() {
        this.setMenuPermissions();
    }

    ngAfterContentChecked(): void {
        this.changeDetector.detectChanges();
    }

    setMenuPermissions(): void {
        this.canAddProduct = userUtility.hasPermission('Add Product');
        this.canViewProduct = userUtility.hasPermission('View Product');
        this.canAddBenefit = userUtility.hasPermission('Add Benefit');
        this.canViewBenefit = userUtility.hasPermission('View Benefit');
        this.canAddProductOption = userUtility.hasPermission('Add Product Option');
        this.canViewProductOption = userUtility.hasPermission('View Product Option');
        this.canAddDiscountType = userUtility.hasPermission('Add Discount Type');
        this.canViewDiscountType = userUtility.hasPermission('View Discount Type');
    }

    navigateTo(): void {
        this.appEventsManager.loadingStart('Please wait..');
        this.router.navigate(['/clientcare/product-manager/product/new/-1']);
    }

    navigateToBenefit(): void {
        this.appEventsManager.loadingStart('Please wait..');
        this.router.navigate(['/clientcare/product-manager/benefit/new/-1']);
    }

    navigateToOption(): void {
        this.appEventsManager.loadingStart('Please wait..');
        this.router.navigate(['/clientcare/product-manager/product-option/new/-1']);
    }
}

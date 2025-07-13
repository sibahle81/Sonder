import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
@Component({
    templateUrl: './payment-layout.component.html'
})
export class PaymentLayoutComponent extends ModuleMenuComponent {
    loadingMessage: string;
    error: Error;
    disable_coid_vaps_e2e_fincare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_FinCare');

    constructor(
        readonly router: Router) {
        super(router);
    }
}

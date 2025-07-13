import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

@Component({
    templateUrl: './claim-home.component.html'
})
export class ClaimHomeComponent implements OnInit {

    disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClaimCare');
    targetModuleType = ModuleTypeEnum.ClaimCare;

    constructor(public readonly router: Router) {
    }

    ngOnInit(): void {
    }
}

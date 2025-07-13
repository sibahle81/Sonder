import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';

@Component({
    templateUrl: './campaign-manager-layout.component.html'
})
export class CampaignManagerLayoutComponent extends ModuleMenuComponent {
    constructor(
        readonly router: Router) {
        super(router);
    }

    home(): void {
        this.router.navigate(['campaign-manager']);
    }
    showCreateWizard(): void {
        this.router.navigate(['/wizard-manager/wizard-host/new/new-campaign', 0]);
    }
}

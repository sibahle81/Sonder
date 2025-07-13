import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';

@Component({
    templateUrl: './client-manager-layout.component.html'
})
export class ClientManagerLayoutComponent extends ModuleMenuComponent {
    constructor(
        readonly router: Router) {
        super(router);
    }

    home(): void {
        this.router.navigate(['clientcare/client-manager']);
    }

    navigateToCommissionRun(): void {
        this.router.navigate(['/broker-commission-list']);
    }
}

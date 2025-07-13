import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from '../../../menu/module-menu.component';

@Component({
    templateUrl: './wizard-menu.component.html'
})
export class WizardMenuComponent extends ModuleMenuComponent {
    constructor(
        readonly router: Router) {
        super(router);
    }

    home(): void {
        this.router.navigate(['wizard-manager']);
    }
}

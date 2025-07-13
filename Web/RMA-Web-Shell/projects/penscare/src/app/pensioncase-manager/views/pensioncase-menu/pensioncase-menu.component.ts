import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';

@Component({
    templateUrl: './pensioncase-menu.component.html',
    styleUrls: ['./pensioncase-menu.component.css']
})
export class PensionCaseMenuComponent extends ModuleMenuComponent {
    constructor(
        readonly router: Router) {
        super(router);
    }

    home(): void {

    }
}

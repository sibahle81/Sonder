import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';

@Component({
    templateUrl: './work-item-menu.component.html',
    styleUrls: ['./work-item-menu.component.css']
})
export class WorkItemMenuComponent extends ModuleMenuComponent {
    constructor(
        readonly router: Router) {
        super(router);
    }

    home(): void {
        
    }
}

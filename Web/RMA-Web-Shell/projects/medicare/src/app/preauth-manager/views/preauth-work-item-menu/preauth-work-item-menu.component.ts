import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';

@Component({
    templateUrl: './preauth-work-item-menu.component.html',
    styleUrls: ['./preauth-work-item-menu.component.css']
})
export class PreAuthWorkItemMenuComponent extends ModuleMenuComponent {
    constructor(
        readonly router: Router) {
        super(router);
    }

    home(): void {
        
    }
}

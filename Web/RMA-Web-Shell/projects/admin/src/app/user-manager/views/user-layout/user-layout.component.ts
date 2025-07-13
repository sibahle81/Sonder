import { Component } from '@angular/core';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { Router } from '@angular/router';

@Component({
    templateUrl: './user-layout.component.html'
})
export class UserLayoutComponent extends ModuleMenuComponent {
    constructor(
    readonly router: Router) {
    super(router);
    }

    home(): void {
        this.router.navigate(['user-manager']);
    }

    roles(): void {
        this.router.navigate(['user-manager/role-list']);
    }
}

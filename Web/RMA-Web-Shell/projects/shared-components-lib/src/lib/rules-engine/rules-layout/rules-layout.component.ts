import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ModuleMenuComponent } from '../../menu/module-menu.component';

@Component({
    templateUrl: './rules-layout.component.html'
})
export class RulesLayoutComponent extends ModuleMenuComponent implements OnInit {

    constructor(
        readonly router: Router,
        private readonly authService: AuthService) {
        super(router);
    }

    ngOnInit() {
        this.setMenuPermissions();
    }

    setMenuPermissions(): void {
        const permissions = this.authService.getCurrentUserPermissions();
    }

}

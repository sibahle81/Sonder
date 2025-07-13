import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { ModuleMenuComponent } from '../../menu/module-menu.component';

@Component({
    templateUrl: './rules-layout.component.html'
})
export class RulesLayoutComponent extends ModuleMenuComponent implements OnInit {

    constructor(
        readonly router: Router,
        private readonly authService: AuthService,
        private readonly appeventmanager: AppEventsManager) {
        super(router);
    }

    ngOnInit() {
        this.setMenuPermissions();
    }

    setMenuPermissions(): void {
        const permissions = this.authService.getCurrentUserPermissions();
    }

}

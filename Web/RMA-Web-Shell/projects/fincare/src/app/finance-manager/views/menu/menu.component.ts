import { Component ,OnInit} from '@angular/core';
import { Router } from '@angular/router';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';

@Component({
  selector: 'finance-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent extends ModuleMenuComponent {
    loadingMessage: string;
    error: Error;

    constructor(
readonly router: Router,
appEventsManager: AppEventsManager) {
super(router);
    }
}

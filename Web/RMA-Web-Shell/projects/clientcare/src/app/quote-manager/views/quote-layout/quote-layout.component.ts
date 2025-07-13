import { Component } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { MasterMenuComponent } from 'projects/shared-components-lib/src/lib/menu/master-menu.component';

@Component({
  templateUrl: './quote-layout.component.html'
})
export class QuoteLayoutComponent extends MasterMenuComponent {

  constructor(
    appEventsManager: AppEventsManager) {
    super(appEventsManager);
  }
}

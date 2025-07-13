import { Component, OnInit } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { MasterMenuComponent } from 'projects/shared-components-lib/src/lib/menu/master-menu.component';

@Component({
  templateUrl: './medical-report-layout.component.html'
})
export class MedicalReportLayoutComponent extends MasterMenuComponent {

  constructor(
    appEventsManager: AppEventsManager) {
    super(appEventsManager);
  }
}

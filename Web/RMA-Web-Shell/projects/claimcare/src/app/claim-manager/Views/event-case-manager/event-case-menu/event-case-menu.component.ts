import { Component, OnInit } from '@angular/core';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'event-case-menu',
  templateUrl: './event-case-menu.component.html',
  styleUrls: ['./event-case-menu.component.css']
})
export class EventCaseMenuComponent extends ModuleMenuComponent {
  loadingMessage: string;
  error: Error;

  constructor(
  readonly router: Router,
  private readonly appEventsManager: AppEventsManager) {
    super(router);
  }

  navigateTo(): void {
    this.appEventsManager.loadingStart('Please wait..');
    this.router.navigate(['claimcare/claim-manager/manage-event/new/-1']);
  }
}

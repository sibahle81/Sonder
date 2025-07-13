import { Component, OnInit } from '@angular/core';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { Router } from '@angular/router';

@Component({
  templateUrl: './event-case-layout.component.html',
  styleUrls: ['./event-case-layout.component.css']
})
export class EventCaseLayoutComponent extends ModuleMenuComponent implements OnInit {
  constructor(
      readonly router: Router) {
      super(router);
  }

  ngOnInit() {
      this.setMenuPermissions();
  }

  setMenuPermissions(): void {
  }
}

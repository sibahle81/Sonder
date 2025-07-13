import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';

@Component({
  styleUrls: ['../../../../../../../assets/css/site.css'],
  templateUrl: './reports-layout.component.html'
})
export class ReportsLayoutComponent extends ModuleMenuComponent implements OnInit {
  loadingMessage: string;
  error: Error;
  
  constructor(
    readonly router: Router) {
    super(router);
  }

  ngOnInit() {

  }

  openPensionReports() {
    this.router.navigateByUrl(`penscare/reports-manager/monthend-reports`);
  }
}

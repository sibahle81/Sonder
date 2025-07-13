import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';

@Component({
  selector: 'app-tax-manager-layout',
  templateUrl: './tax-manager-layout.component.html'
})
export class TaxManagerLayoutComponent extends ModuleMenuComponent implements OnInit {
  loadingMessage: string;
  error: Error;
  canRefund: boolean;


  constructor(
    readonly router: Router) {
    super(router);
  }

  ngOnInit() {

  }
}

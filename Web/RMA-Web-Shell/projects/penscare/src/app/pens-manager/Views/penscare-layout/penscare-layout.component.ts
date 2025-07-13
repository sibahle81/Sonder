import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';

@Component({
  styleUrls: ['../../../../../../../assets/css/site.css'],
  templateUrl: './penscare-layout.component.html'
})
export class PensCareLayoutComponent extends ModuleMenuComponent implements OnInit {
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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';

@Component({
  selector: 'app-child-extension-manager-layout',
  templateUrl: './child-extension-manager-layout.component.html',
  styleUrls: ['./child-extension-manager-layout.component.css']
})
export class ChildExtensionManagerLayoutComponent extends ModuleMenuComponent implements OnInit {
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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  templateUrl: './pmp-menu.component.html'
})
export class PMPMenuComponent extends ModuleMenuComponent implements OnInit {

  constructor(
    readonly router: Router) {
    super(router);
  }

  ngOnInit() {

  }
}

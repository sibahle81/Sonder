import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';

@Component({
  templateUrl: './onboarding-layout.component.html',
  styleUrls: ['../../../../../../../assets/css/site.css']
})
export class OnboardingLayoutComponent extends ModuleMenuComponent implements OnInit {

  constructor(
    readonly router: Router) {
    super(router);
  }

  ngOnInit() {

  }

}

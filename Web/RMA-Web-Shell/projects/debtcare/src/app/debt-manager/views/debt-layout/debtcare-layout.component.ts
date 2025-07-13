import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  styleUrls: ['../../../../../../../assets/css/site.css'],
  templateUrl: './debtcare-layout.component.html'
})
export class DebtCareLayoutComponent extends ModuleMenuComponent implements OnInit {
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

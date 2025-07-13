import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';

@Component({
  templateUrl: './broker-manager-layout.component.html'
})
export class BrokerManagerLayoutComponent extends ModuleMenuComponent {

  constructor(
    readonly router: Router) {
    super(router);
  }

  home(): void {
    this.router.navigate(['clientcare/broker-manager']);
  }

  navigateTo(): void {
    this.router.navigate(['/clientcare/broker-manager/brokerage-manager/new/-1']);
  }

  navigateToCommissionRun(): void {
    this.router.navigate(['/broker-commission-list']);
  }

  navigateToLinkAgent(): void {
    this.router.navigate(['clientcare/broker-manager/link-agent/new/-1']);
  }

  navigateToEditBrokerage(): void {
    this.router.navigate(['clientcare/broker-manager/brokerage-manager/new/1']);
  }

  navigateToBrokerageReps(): void {
    this.router.navigate(['clientcare/broker-manager/broker-representative-import']);
  }

  navigateToBinderPartnerImport(): void {
    this.router.navigate(['/clientcare/broker-manager/binderpartner-manager/new/-1']);
  }

  navigateToBinderPartnerReps(): void {
    this.router.navigate(['clientcare/broker-manager/binderpartner-representative-import']);
  }


}

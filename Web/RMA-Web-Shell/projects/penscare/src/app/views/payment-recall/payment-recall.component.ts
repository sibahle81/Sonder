import { Component } from '@angular/core';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';

declare interface RouteInfo {
  path: string;
  title: string;

}

const ROUTES: RouteInfo[] = [
  { path: 'home', title: 'Home'}
]

@Component({
  selector: 'app-payment-recall',
  templateUrl: './payment-recall.component.html',
  styleUrls: ['./payment-recall.component.css']
})

export class PaymentRecallComponent {
  loadedTab = 'home';
  isLoading: boolean;
  tabItem!: any;
  paymentTypeFilter: PaymentTypeEnum[] = [PaymentTypeEnum.Pension, PaymentTypeEnum.CapitalValue];
  constructor() {
    this.tabItem = ROUTES.filter(item => item);
  }

  tabSelection(tab: string): void {
    this.loadedTab = tab;
  }
}

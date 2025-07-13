import { Component, OnInit } from '@angular/core';
import { BreadcrumbBrokerService } from '../../services/breadcrumb-broker.service';

@Component({
  templateUrl: './broker-manager-home.component.html',
})
export class BrokerManagerHomeComponent implements OnInit {
  constructor(private readonly breadcrumbService: BreadcrumbBrokerService) {
  }

  ngOnInit(): void {
      this.breadcrumbService.setBreadcrumb('Broker Home');
  }
}

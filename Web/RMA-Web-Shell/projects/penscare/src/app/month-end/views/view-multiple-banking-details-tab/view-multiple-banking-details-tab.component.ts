import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MultipleBankingDetailNotification } from 'projects/shared-components-lib/src/lib/models/multiple-banking-detail-notification.model';
import { MultipleBankingDetailsComponent } from '../multiple-banking-details/multiple-banking-details.component';

class ComponentInputData {
  public model: MultipleBankingDetailNotification;
}

@Component({
  selector: 'app-view-multiple-banking-details-tab',
  templateUrl: './view-multiple-banking-details-tab.component.html',
  styleUrls: ['./view-multiple-banking-details-tab.component.css']
})
export class ViewMultipleBankingDetailsTabComponent implements OnInit {

  @Input() componentInputData: ComponentInputData;
  @ViewChild(MultipleBankingDetailsComponent, { static: true }) multipleBankingDetailsComponent: MultipleBankingDetailsComponent;

  constructor() { }

  ngOnInit(): void {
    this.multipleBankingDetailsComponent.setViewData(this.componentInputData.model, false)
  }

}

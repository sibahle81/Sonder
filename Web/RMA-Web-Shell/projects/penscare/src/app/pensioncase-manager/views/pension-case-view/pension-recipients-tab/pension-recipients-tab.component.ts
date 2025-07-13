import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { InitiatePensionCaseData } from 'projects/penscare/src/app/shared-penscare/models/initiate-pensioncase-data.model';
import { RecipientInformationComponent } from '../../wizards/initiate-pension-case-wizard/recipient-information/recipient-information.component';
class ComponentInputData {
  public model: InitiatePensionCaseData
}

@Component({
  selector: 'app-pension-recipients-tab',
  templateUrl: './pension-recipients-tab.component.html',
  styleUrls: ['./pension-recipients-tab.component.css']
})
export class PensionRecipientsTabComponent implements OnInit {
  @Input() componentInputData: ComponentInputData;
  @ViewChild(RecipientInformationComponent, { static: true }) recipientInformationComponent: RecipientInformationComponent;

  constructor() { }

  ngOnInit(): void {
    this.recipientInformationComponent.setViewData(this.componentInputData.model, false)
  }
}

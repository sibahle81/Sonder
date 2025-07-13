import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { InitiatePensionCaseData } from 'projects/penscare/src/app/shared-penscare/models/initiate-pensioncase-data.model';
import { ClaimInformationListComponent } from '../../wizards/initiate-pension-case-wizard/claim-information/claim-information-list/claim-information-list.component';

class ComponentInputData {
  public model: InitiatePensionCaseData
}

@Component({
  selector: 'app-pension-claims-tab',
  templateUrl: './pension-claims-tab.component.html',
  styleUrls: ['./pension-claims-tab.component.css']
})
export class PensionClaimsTabComponent implements OnInit {

  @Input() componentInputData: ComponentInputData;
  @ViewChild(ClaimInformationListComponent, { static: true }) claimInformationListComponent: ClaimInformationListComponent;

  constructor() { }
  ngOnInit(): void {
    this.claimInformationListComponent.setViewData(this.componentInputData.model, false)
  }
}

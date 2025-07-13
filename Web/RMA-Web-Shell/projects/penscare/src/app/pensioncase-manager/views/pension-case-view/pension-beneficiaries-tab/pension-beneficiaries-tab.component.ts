import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { InitiatePensionCaseData } from 'projects/penscare/src/app/shared-penscare/models/initiate-pensioncase-data.model';
import { BeneficiaryInformationComponent } from '../../wizards/initiate-pension-case-wizard/beneficiary-information/beneficiary-information.component';

class ComponentInputData {
  public model: InitiatePensionCaseData
}

@Component({
  selector: 'app-pension-beneficiaries-tab',
  templateUrl: './pension-beneficiaries-tab.component.html',
  styleUrls: ['./pension-beneficiaries-tab.component.css']
})
export class PensionBeneficiariesTabComponent implements OnInit {
  @Input() componentInputData: ComponentInputData;
  @ViewChild(BeneficiaryInformationComponent, { static: true }) beneficiaryInformationComponent: BeneficiaryInformationComponent;

  constructor() { }

  ngOnInit(): void {
    this.beneficiaryInformationComponent.setViewData(this.componentInputData.model, false)
  }

}

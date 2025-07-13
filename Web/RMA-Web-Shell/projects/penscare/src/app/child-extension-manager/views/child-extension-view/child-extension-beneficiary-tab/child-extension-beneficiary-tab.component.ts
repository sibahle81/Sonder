import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChildToAdultPensionLedger } from 'projects/penscare/src/app/shared-penscare/models/child-to-adult-pension-ledger.model';
import { ChildExtensionBeneficiaryComponent } from '../../../wizards/child-extension-wizard/child-extension-beneficiary/child-extension-beneficiary.component';

class ComponentInputData {
  public model: ChildToAdultPensionLedger
}
@Component({
  selector: 'app-child-extension-beneficiary-tab',
  templateUrl: './child-extension-beneficiary-tab.component.html',
  styleUrls: ['./child-extension-beneficiary-tab.component.css']
})
export class ChildExtensionBeneficiaryTabComponent implements OnInit {

  @Input() componentInputData: ComponentInputData;
  @ViewChild(ChildExtensionBeneficiaryComponent, { static: true }) beneficiaryInformationComponent: ChildExtensionBeneficiaryComponent;

  constructor() { }

  ngOnInit(): void {
    this.beneficiaryInformationComponent.setViewData(this.componentInputData.model, false)
  }
}

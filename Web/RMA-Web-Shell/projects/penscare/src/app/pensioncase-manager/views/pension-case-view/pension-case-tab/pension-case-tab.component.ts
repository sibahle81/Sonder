import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';
import { InitiatePensionCaseData } from 'projects/penscare/src/app/shared-penscare/models/initiate-pensioncase-data.model';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { PensionCaseDetailsComponent } from '../../wizards/initiate-pension-case-wizard/pension-case-details/pension-case-details.component';

class ComponentInputData {
  public model: InitiatePensionCaseData;
  public lookups: {
    genders: Lookup[],
    benefitTypes: Lookup[],
  }
}
@Component({
  selector: 'app-pension-case-tab',
  templateUrl: './pension-case-tab.component.html',
  styleUrls: ['./pension-case-tab.component.css']
})
export class PensionCaseTabComponent implements OnInit {
  @Input() componentInputData: ComponentInputData
  pensionCaseContext = PensionCaseContextEnum;
  @ViewChild(PensionCaseDetailsComponent, { static: true }) pensionCaseDetailsComponent: PensionCaseDetailsComponent;

  constructor() { }

  ngOnInit(): void {
    this.pensionCaseDetailsComponent.setViewData(this.componentInputData.model, false)
  }
}

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';
import { InitiatePensionCaseData } from '../../../../shared-penscare/models/initiate-pensioncase-data.model';
import { PensionLedgerComponent } from '../../wizards/initiate-pension-case-wizard/pension-ledger/pension-ledger.component';

@Component({
  selector: 'app-pension-ledgers-tab',
  templateUrl: './pension-ledgers-tab.component.html'
})
export class PensionLedgersTabComponent implements OnInit {
  @Input() model: InitiatePensionCaseData;
  @Input() tabName: string;
  @ViewChild(PensionLedgerComponent, { static: true }) pensionLedgerComponent: PensionLedgerComponent;
  pensionCaseContext = PensionCaseContextEnum;

  constructor() { }

  ngOnInit(): void {
    this.pensionLedgerComponent.setViewData(this.model, false)
  }
}

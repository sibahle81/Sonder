import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChildToAdultPensionLedger } from 'projects/penscare/src/app/shared-penscare/models/child-to-adult-pension-ledger.model';
import { ChildExtensionRecipientComponent } from '../../../wizards/child-extension-wizard/child-extension-recipient/child-extension-recipient.component';

class ComponentInputData {
  public model: ChildToAdultPensionLedger
}

@Component({
  selector: 'app-child-extension-recipient-tab',
  templateUrl: './child-extension-recipient-tab.component.html',
  styleUrls: ['./child-extension-recipient-tab.component.css']
})
export class ChildExtensionRecipientTabComponent implements OnInit {
  @Input() componentInputData: ComponentInputData;
  @ViewChild(ChildExtensionRecipientComponent, { static: true }) childExtensionRecipientComponent: ChildExtensionRecipientComponent;

  constructor() { }

  ngOnInit(): void {
    this.childExtensionRecipientComponent.setViewData(this.componentInputData.model, false)
  }
}

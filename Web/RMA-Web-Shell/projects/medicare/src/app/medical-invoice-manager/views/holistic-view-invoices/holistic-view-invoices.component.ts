import { Component, Input, SimpleChanges } from '@angular/core';
import { SwitchBatchType } from '../../../shared/enums/switch-batch-type';

@Component({
  selector: 'app-holistic-view-invoices',
  templateUrl: './holistic-view-invoices.component.html',
  styleUrls: ['./holistic-view-invoices.component.css']
})
export class HolisticViewInvoicesComponent {

  switchBatchTypeEnum = SwitchBatchType
  @Input() personEventId = 0;

  constructor() {
  }

  ngOnInit() {
    
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.personEventId?.currentValue) {
      this.personEventId = changes?.personEventId?.currentValue
    }

  }


}

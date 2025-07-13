import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Brokerage } from 'projects/clientcare/src/app/broker-manager/models/brokerage';
import { BrokerageService } from 'projects/clientcare/src/app/broker-manager/services/brokerage.service';

@Component({
  selector: 'brokerage-view-v2',
  templateUrl: './brokerage-view.component.html',
  styleUrls: ['./brokerage-view.component.css']
})
export class BrokerageViewComponent implements OnChanges {

  @Input() brokerageId: number;

  @Output() brokerageEmit: EventEmitter<Brokerage> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  brokerage: Brokerage;

  constructor(
    private readonly brokerageService: BrokerageService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.brokerageId) {
      this.getBrokerage();
    }
  }

  getBrokerage() {
    this.isLoading$.next(true);
    this.brokerageService.getBrokerageBasicReferenceData(this.brokerageId).subscribe(result => {
      this.brokerage = result;
      this.isLoading$.next(false);
    });
  }
}

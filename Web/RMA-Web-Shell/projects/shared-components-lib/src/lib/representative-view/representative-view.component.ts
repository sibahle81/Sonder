import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Representative } from 'projects/clientcare/src/app/broker-manager/models/representative';
import { RepresentativeService } from 'projects/clientcare/src/app/broker-manager/services/representative.service';

@Component({
  selector: 'representative-view-v2',
  templateUrl: './representative-view.component.html',
  styleUrls: ['./representative-view.component.css']
})
export class RepresentativeViewComponent implements OnChanges {

  @Input() representativeId: number;

  @Output() representativeEmit: EventEmitter<Representative> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  representative: Representative;

  constructor(
    private readonly representativeService: RepresentativeService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.representativeId) {
      this.getRepresentative();
    }
  }

  getRepresentative() {
    this.isLoading$.next(true);
    this.representativeService.getRepresentative(this.representativeId).subscribe(result => {
      this.representative = result;
      this.isLoading$.next(false);
    });
  }
}

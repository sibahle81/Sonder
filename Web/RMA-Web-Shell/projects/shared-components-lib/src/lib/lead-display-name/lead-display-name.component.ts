import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Lead } from 'projects/clientcare/src/app/lead-manager/models/lead';
import { LeadService } from 'projects/clientcare/src/app/lead-manager/services/lead.service';

@Component({
  selector: 'lead-display-name',
  templateUrl: './lead-display-name.component.html',
  styleUrls: ['./lead-display-name.component.css']
})
export class LeadDisplayNameComponent implements OnChanges {

  @Input() leadId: number;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  lead: Lead;

  constructor(
    private readonly leadService: LeadService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.leadId) {
      this.getLead();
    }
  }

  getLead() {
    this.leadService.getLead(this.leadId).subscribe(result => {
      this.lead = result;
      this.isLoading$.next(false);
    });
  }
}

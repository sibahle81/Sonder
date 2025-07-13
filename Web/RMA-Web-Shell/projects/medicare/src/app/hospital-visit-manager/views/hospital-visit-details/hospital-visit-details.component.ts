import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ClinicalUpdateService } from 'projects/medicare/src/app/hospital-visit-manager/services/hospital-visit.service';
import { isNullOrUndefined } from 'util';
@Component({
  selector: 'hospital-visit-details',
  templateUrl: './hospital-visit-details.component.html',
  styleUrls: ['./hospital-visit-details.component.css'],
})
export class HospitalVisitDetailsComponent implements OnInit {
  clinicalUpdateList: any;
  @Input() preAuthId: number;

  constructor(private clinicalUpdateService: ClinicalUpdateService) { }
  ngOnInit(): void {
    if (this.preAuthId) {
      this.clinicalUpdateService.getPreAuthClinicalUpdates(this.preAuthId).subscribe(
        res => {
          this.clinicalUpdateList = res;
        });
    }
  }
}
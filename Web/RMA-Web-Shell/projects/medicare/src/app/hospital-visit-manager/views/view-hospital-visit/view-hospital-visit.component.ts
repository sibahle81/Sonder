import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// import { MatTableDataSource } from '@angular/material';
import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { ClinicalUpdateService } from 'projects/medicare/src/app/hospital-visit-manager/services/hospital-visit.service';
import { Observable } from 'rxjs';
import { ClinicalUpdate } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update.interface';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-view-hospital-visit',
  templateUrl: './view-hospital-visit.component.html',
  styleUrls: ['./view-hospital-visit.component.css']
})
export class ViewHospitalVisitComponent implements OnInit {
  displayedColumns = ['itemCode', 'description', 'tariffAmount', 'requestedQuantity', 
    'requestedAmount', 'authorisedAmount', 'isAuthorised', 'quantityReducedReason'];
    @Input() auth: PreAuthorisation;
    @Input() bodySides: Array<any>;
    @Input() isInternalUser: boolean;
    dataSource: Array<PreAuthorisationBreakdown>;

  constructor(private router: Router, private route: ActivatedRoute, private clinicalUpdateService: ClinicalUpdateService) { 
  }
  clinicalView 
  ngOnInit() {
    let preAuthId = 0;
    preAuthId = history.state.preAuthId;
    
    this.clinicalUpdateService.getPreAuthClinicalUpdates(preAuthId).subscribe(
      res => {
        this.clinicalView = res;
      },
      error => { },
          () => {
      console.log(this.clinicalView);
      })
    };
  }



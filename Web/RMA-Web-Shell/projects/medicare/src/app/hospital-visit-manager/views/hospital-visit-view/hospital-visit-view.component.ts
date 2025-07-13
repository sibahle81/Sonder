import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ClinicalUpdate } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update.interface';
import { ClinicalUpdateService } from '../../services/hospital-visit.service';
@Component({
    selector: 'app-hospital-visit-view',
    templateUrl: './hospital-visit-view.component.html',
    styleUrls: ['./hospital-visit-view.component.css'],
  })
  export class ViewHospitalVisitComponent implements OnInit {
    form: UntypedFormGroup;
    clinicalUpdate:ClinicalUpdate;
    @Input() clinicalUpdateId: number;    
    @Output() clinicalUpdateResult: EventEmitter<ClinicalUpdate> = new EventEmitter<ClinicalUpdate>();

    constructor(private clinicalUpdateService: ClinicalUpdateService){}
    ngOnInit(): void {

        this.clinicalUpdateService.getClinicalUpdate(this.clinicalUpdateId).subscribe((data) => {
            if (data !== null) {              
                this.clinicalUpdateResult.emit(data);
                if(data.clinicalUpdateId>0){
                    this.clinicalUpdate = data;
                }
            }
          });
        }
  }
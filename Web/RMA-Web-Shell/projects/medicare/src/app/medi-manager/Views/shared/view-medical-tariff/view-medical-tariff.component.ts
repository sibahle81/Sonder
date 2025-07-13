import { Component, Input, OnInit, Output, EventEmitter  } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { isNullOrUndefined } from 'util';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';


@Component({
  selector: 'app-view-medical-tariff',
  templateUrl: './view-medical-tariff.component.html',
  styleUrls: ['./view-medical-tariff.component.css']
})
export class ViewMedicalTariffComponent implements OnInit {

  @Input() tariffId: number;
  @Input() showSubmit: boolean=false;
  @Output() onClose: EventEmitter<boolean> = new EventEmitter();
  @Output() onSubmit: EventEmitter<any> = new EventEmitter();

  tariffTypes: any=[];
  practitionerTypes: Lookup[];
  tariffData: any;
  showDetails:boolean = false;
  
  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    public datepipe: DatePipe,
    readonly mediCarePreAuthService: MediCarePreAuthService,
    readonly confirmservice: ConfirmationDialogsService) {
      this.getLookups();
    }

  ngOnInit(): void {
      this.loading$.next(true);
  }

getLookups() {
  this.getTariffTypes();
}

getTariffData(){
  if(!isNullOrUndefined(this.tariffId))
  {
  this.mediCarePreAuthService.getTariff(this.tariffId).subscribe(result => {
    this.tariffData = result;
    this.showDetails = true;
    this.loading$.next(false);
});

  }
}

getTariffTypes(){
  let tariffTypeTemp = [];
  this.mediCarePreAuthService.getTariffTypes().subscribe(
     (x) => {
      tariffTypeTemp = x;
    },
    () => { },
    () => {
      if (tariffTypeTemp) {
        tariffTypeTemp.forEach(x => {
          this.tariffTypes.push({'id': x.id, 'name': x.name});
        });
        this.getTariffData();
      }
    });
}

getTariffName(tariffTypeId: number){
  return this.tariffTypes.find((tariff) => tariff.id == tariffTypeId).name;
}

onNavigateBack(){
  this.onClose.emit(true);
}

onTariffSubmit(){
  this.onSubmit.emit(this.tariffData);
}
  
}

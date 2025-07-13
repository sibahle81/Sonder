
import { Component, EventEmitter, Input, OnInit, Output, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { CrudActionType } from '../../../shared/enums/crud-action-type';

@Component({
  selector: 'app-is-in-or-out-hospital-check',
  templateUrl: './is-in-or-out-hospital-check.component.html',
  styleUrls: ['./is-in-or-out-hospital-check.component.css']
})
export class IsInOROutHospitalCheckComponent implements OnInit,AfterViewInit  {

  @Input() isInHospitalSet: boolean;//by default controls are enabled until checks have been performed
  @Input() crudActionType: CrudActionType;
  @Output() isInHospitalSetEvent = new EventEmitter<boolean>();
  isInHospital = new FormControl();

  inOutHospitalListOfOptions = [
    { name: "In-Hospital", value: true, ID: "In-Hospital", checked: false },
    { name: "Out-Hospital", value: false, ID: "Out-Hospital", checked: false }
  ]

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.disableIsInHospitalCheck(this.isInHospitalSet,this.crudActionType);
    
    this.isInHospital.valueChanges.subscribe(value => {
      this.isInHospitalSetEmitter(value as boolean)

    });

  }

  ngAfterViewInit() {
    
    switch (this.isInHospitalSet) {
      case true:
        this.inOutHospitalListOfOptions[0].checked = this.isInHospitalSet;
        break;
        case false:
          this.inOutHospitalListOfOptions[1].checked = !this.isInHospitalSet;//inverse selection so Out-Hospital = false is checked
        break;
      default:
        this.inOutHospitalListOfOptions[0].checked = false;
        this.inOutHospitalListOfOptions[1].checked = false;
        break;
    }

    this.cdr.detectChanges();
  }

  isInHospitalSetEmitter(value: boolean) {
    this.isInHospitalSetEvent.emit(value)
  }

  disableIsInHospitalCheck(disableValue: boolean,crudActionType:CrudActionType) {
    
    if(crudActionType == CrudActionType.edit || crudActionType == CrudActionType.create){
      this.isInHospital.enable()
    }
    else{
      this.isInHospital.disable()
    }
  }

}

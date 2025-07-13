import { Component, OnInit } from '@angular/core';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';

@Component({
  selector: 'app-medicare-person-search',
  templateUrl: './medicare-person-search.component.html',
  styleUrls: ['./medicare-person-search.component.css']
})
export class MedicarePersonSearchComponent implements OnInit {

  selectedPerson:RolePlayer;
  rolePlayerIdentificationTypes: RolePlayerIdentificationTypeEnum[] = [ RolePlayerIdentificationTypeEnum.Person, RolePlayerIdentificationTypeEnum.HealthCareProvider];

  constructor() { }

  ngOnInit(): void {
  }

  setPerson($event: RolePlayer){
    this.selectedPerson = $event;
  }
}

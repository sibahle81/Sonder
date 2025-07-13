import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { RolePlayer } from '../../shared/entities/roleplayer';
import { Person } from '../../shared/entities/person';
import { PersonDetailsComponent } from '../person-details/person-details.component';

@Component({
  templateUrl: './person-details-dialog.component.html'
})
export class PersonDetailsDialogComponent implements OnInit {

  @ViewChild(PersonDetailsComponent, { static: true }) personDetails: PersonDetailsComponent;
  rolePlayer: RolePlayer;

  constructor(
    public dialogRef: MatDialogRef<PersonDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RolePlayer
  ) {
    this.rolePlayer = data;
  }

  ngOnInit(): void {
    this.personDetails.setViewData(this.rolePlayer);
  }

  getPerson(): Person {
    this.personDetails.populateModel();
    return this.personDetails.model.person;
  }
}

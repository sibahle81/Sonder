import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

@Component({
  selector: 'app-role-player-dialog-registration-number',
  templateUrl: './role-player-dialog-registration-number.component.html',
  styleUrls: ['./role-player-dialog-registration-number.component.css']
})
export class RolePlayerDialogRegistrationNumberComponent implements OnInit {

  dataSource: any;
  title: string;
  registrationNumber: string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  filter: ElementRef;
  displayedColumns = ['registrationNumber', 'firstName', 'lastName', 'idNumber','passportNumber','actions'];
  constructor(public dialogRef: MatDialogRef<RolePlayerDialogRegistrationNumberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.dataSource = new MatTableDataSource(data.dataSource);
      this.title = data.title;
      this.registrationNumber =data.registrationNumber;
    }

  ngOnInit(){ }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
  onSelect(rolePlayer: RolePlayer): void {
    this.dialogRef.close(rolePlayer);
  }

}

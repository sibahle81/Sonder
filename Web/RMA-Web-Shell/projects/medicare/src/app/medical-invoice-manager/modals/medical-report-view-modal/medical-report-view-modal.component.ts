import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-medical-report-view-modal',
  templateUrl: './medical-report-view-modal.component.html',
  styleUrls: ['./medical-report-view-modal.component.css']
})
export class MedicalReportViewModalComponent implements OnInit {

  loading$ = new BehaviorSubject<boolean>(true);
  medicalReportFormId: number;
  constructor( @Inject(MAT_DIALOG_DATA) private data: any) {
    this.medicalReportFormId = data.id;
  }

  ngOnInit() {

  }
  
}


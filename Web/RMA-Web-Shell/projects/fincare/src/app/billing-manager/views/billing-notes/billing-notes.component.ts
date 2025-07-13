import { Component, OnInit, Input, ViewChild, ElementRef, Output } from '@angular/core';
import { BillingService } from '../../services/billing.service';
import { BehaviorSubject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { DialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NoteDialogComponent } from './dialog/dialog.component';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';

@Component({
  selector: 'billing-notes',
  templateUrl: './billing-notes.component.html',
  styleUrls: ['./billing-notes.component.css']
})
export class BillingNotesComponent implements OnInit {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  displayColumns = ['context', 'text', 'createdBy', 'createdDate', 'action'];

  @Input() roleplayerId: number;
  @Output() _roleplayerId: number;
  notes: Note[];
  dataSource = new MatTableDataSource();
  isAddNew= 0;
  constructor(
    public dialog: MatDialog,
    private readonly billingService: BillingService) { }

  ngOnInit() {
    this.isLoading$.next(true);
    this.getNotes();
    this.isAddNew = 0;
    this._roleplayerId = this.roleplayerId;
  }

  getNotes() {
    this.billingService.getAllBillingNotesByRoleplayerId(this.roleplayerId).subscribe(notes => {
      this.notes = notes;
      this.dataSource = new MatTableDataSource<Note>(this.notes);
      this.isLoading$.next(false);
    });
  }

  view(noteText) {
    const messageList: string[] = [];

    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '600px',
      height: 'auto',
      data: { noteText }
    });

    dialogRef.afterClosed().subscribe(response => {

    });
  }

  addNote(){
    this.isAddNew = 1;
  }

  goBack(){
    this.isAddNew = 0;
  }
}

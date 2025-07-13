import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NotesRequest } from '../notes/notes-request';
import { NotesService } from '../notes/notes.service';
import { Note } from '../../models/note.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';

@Component({
  styleUrls: ['./notes-dialog.component.css'],
  templateUrl: './notes-dialog.component.html'
})
export class NotesDialogComponent implements OnInit, AfterViewInit {

  mode = 'view';

  loadingNotes = false;
  noteMessage = new FormControl('', [Validators.required]);

  showActionsLink = true;
  columns: any;
  displayedColumns: string[];
  actionsLinkText = 'View / Edit';
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isData$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public dataSource = new MatTableDataSource<Note>();

  get count(): number {
    return this.dataSource.data.length;
  }

  get hasError(): boolean {
    if (this.noteMessage) {
      if (this.noteMessage.touched) {
        return this.noteMessage.hasError('required');
      }
    }
    return false;
  }

  constructor(
    public dialog: MatDialogRef<NotesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NotesRequest,
    private readonly noteService: NotesService,
    private readonly datePipe: DatePipe,
  ) {
    this.getData(this.data);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    if (this.showActionsLink) { this.displayedColumns.push('actions'); }
    this.clearMessage();
  }

  getData(data: NotesRequest): void {
    this.getSourceData(data);
  }

  // used in other views when data must be collected from the service
  getSourceData(noteRequest: NotesRequest): void {
    this.noteService.getNotes(noteRequest.serviceType, noteRequest.itemType, noteRequest.itemId).subscribe(
      notes => {
        this.dataSource.data = notes;
      });
  }

  clearMessage(): void {
    this.noteMessage.setValue('');
    this.noteMessage.markAsUntouched();
    this.noteMessage.markAsPristine();
  }

  getNotes(): Note[] {
    const notes: Note[] = [];
    for (let i = 0; i < 3; i++) {
      const note = this.dataSource.data[i];
      if (note) {
        notes.push(note);
      }
    }
    return notes;
  }

  setupDisplayColumns(): void {
    this.columns = [
      { columnDefinition: 'note', header: 'Note', cell: (row: Note) => row.text },
      { columnDefinition: 'username', header: 'User', cell: (row: Note) => row.createdBy },
      { columnDefinition: 'date', header: 'Date Added/Modified', cell: (row: Note) => this.datePipe.transform(row.modifiedDate, 'medium') }
    ];
  }

  addNote(): void {
    this.mode = 'add';
    this.noteMessage.setValue('');
  }

  saveNote(): void {
    if (!this.noteMessage.valid) {
      this.noteMessage.markAsTouched();
      return;
    }

    const note = new Note();
    note.itemType = this.data.itemType;
    note.itemId = this.data.itemId;
    note.text = this.noteMessage.value;

    this.loadingNotes = true;
    this.noteService.addNote(this.data.serviceType, note).subscribe(
      data => {
        this.mode = 'view';
        this.loadingNotes = false;
        this.getData(this.data);
      }
    );
  }

  closeDialog(): void {
    if (this.mode === 'add') {
      this.clearMessage();
      this.mode = 'view';
    } else {
      this.dialog.close();
    }
  }
}

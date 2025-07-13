import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';

import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { ListFilteredComponent } from '../list-filtered-component/list-filtered.component';
import { NotesDatasource } from '../notes/notes.datasource';
import { NotesRequest } from '../notes/notes-request';
import { NotesService } from '../notes/notes.service';
import { Note } from '../notes/note';

@Component({
  styleUrls: ['./notes-dialog.component.css'],
  templateUrl: './notes-dialog.component.html'
})
export class NotesDialogComponent extends ListFilteredComponent implements OnInit {

  mode = 'view';

  loadingNotes = false;
  noteMessage = new UntypedFormControl('', [Validators.required]);

  get count(): number {
    return this.notesDataSource.data.length;
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
    router: Router,
    public dialog: MatDialogRef<NotesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NotesRequest,
    private readonly notesDataSource: NotesDatasource,
    private readonly noteService: NotesService,
    private readonly datePipe: DatePipe,
  ) {
    super(router, notesDataSource, '', '', '');
    this.getData(this.data);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.clearMessage();
  }

  getData(data: NotesRequest): void {
    this.notesDataSource.getData(data);
  }

  clearMessage(): void {
    this.noteMessage.setValue('');
    this.noteMessage.markAsUntouched();
    this.noteMessage.markAsPristine();
  }

  getNotes(): Note[] {
    const notes: Note[] = [];
    for (let i = 0; i < 3; i++) {
      const note = this.notesDataSource.data[i];
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

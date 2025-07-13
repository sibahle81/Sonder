import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PensCareNote } from '../../models/penscare-note';

@Component({
  selector: 'app-penscare-notes',
  templateUrl: './penscare-notes.component.html',
  styleUrls: ['./penscare-notes.component.css']
})
export class PenscareNotesComponent implements OnInit {
  displayedColumns = ['title', 'modifiedBy', 'modifiedDate', 'actions'];
  selectedNote: PensCareNote;
  @Input() dataSource: PensCareNote[];
  @Output() onUpdateNotes = new EventEmitter<PensCareNote[]>();
  @Input() canEdit: boolean;

  viewMode = false;
  editMode = false;
  viewListMode = true;

  menus: { title: string; disable: boolean, action: string }[];

  constructor() { }

  ngOnInit(): void {
  }

  onMenuItemClick(selectedNote: PensCareNote, menu): void {
    this.viewListMode = false;
    switch (menu.action) {
      case 'view':
        this.selectedNote = selectedNote;
        this.viewMode = true;
        break;
      case 'edit':
        this.selectedNote = selectedNote;
        this.editMode = true;
        break
    }
  }

  addNote() {
    this.selectedNote = {
      text: '',
      title: ''
    }
    this.editMode = true;
    this.viewListMode = false;
  }

  onCancel() {
    this.editMode = false;
    this.viewMode = false;
    this.viewListMode = true;
  }

  filterMenu(item) {
    this.menus = null;
    this.menus =
      [
        { title: 'Edit', action: 'edit', disable: !this.canEdit },
        { title: 'View', action: 'view', disable: false}
      ];
  }

  onSaveNote(note: PensCareNote) {
    this.editMode = false;
    let dataSource = this.dataSource;
    // Add note
    if (dataSource.length === 0 || dataSource.find(item => {return item.index === note.index}) === undefined) {
      dataSource.push(note);
      this.updateDataSourceIndeces(dataSource);
      this.onUpdateNotes.emit(this.dataSource);
      this.viewListMode = true;
      return
    }

    // Edit note
    dataSource.map(item => {
      const newItem = item;
      if (newItem.index === note.index) {
        return note;
      }
      return newItem
    })
    this.updateDataSourceIndeces(dataSource);
    this.viewListMode = true;
    this.onUpdateNotes.emit(this.dataSource);
  }

  updateDataSourceIndeces(dataSource: PensCareNote[]) {
    this.dataSource = dataSource.map((item, index) => {
      const newItem = item;
      newItem.index = index;
      return newItem;
    })
  }
}

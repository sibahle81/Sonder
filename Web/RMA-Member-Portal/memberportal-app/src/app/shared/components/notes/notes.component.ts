import { Component, OnInit, Input, QueryList, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotesRequest } from './notes-request';
import { NotesService } from './notes.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { Note } from '../../models/note.model';
import { AlertService } from '../../services/alert.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MultiSelectComponent } from '../multi-select/multi-select.component';
import { BehaviorSubject, of } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';



@Component({
  // tslint:disable-next-line:component-selector
  selector: 'notes',
  templateUrl: './notes.component.html'
})
export class NotesComponent implements OnInit, AfterViewInit {
  @Input() name: string;
  @Input() title: string;
  form: FormGroup;

  showActionsLink = true;
  columns: any;
  displayedColumns: string[];
  actionsLinkText = 'View / Edit';
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChildren(MultiSelectComponent)
  multiSelectComponentChildren: QueryList<MultiSelectComponent>;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isData$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public dataSource = new MatTableDataSource<Note>();

  isWizard: boolean;
  notesRequest: NotesRequest;
  selectedNote: Note;
  currentUser: string;
  individualLoading = false;
  displayName: string;
  displayNameForOnScreen: string;
  showLabelForLabelAdded: boolean;
  mode = 'view';
  hasViewOnly = false;
  wizardInApprovalMode = false;

  requiresPermissions = false;
  addPermission: string;
  editPermission: string;

  constructor(
    protected readonly alertService: AlertService,
    private readonly formBuilder: FormBuilder,
    private readonly datePipe: DatePipe,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly noteService: NotesService,
  ) {
    this.actionsLinkText = 'View';
    this.showActionsLink = true;
    this.setupDisplayColumns();
    this.displayedColumns = this.columns.map((column: any) => column.columnDefinition);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    if (this.showActionsLink) { this.displayedColumns.push('actions'); }
    this.currentUser = this.authService.getUserEmail();
    this.createForm();
  }

  createForm(): void {
    this.checkUserAddPermission();
    this.form = this.formBuilder.group({
      id: '',
      text: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  setForm(note: Note): void {
    this.form.patchValue({
      id: note.id,
      text: note.text
    });
  }

  readForm(): Note {
    const formModel = this.form.value;

    this.selectedNote.id = formModel.id === null ? 0 : formModel.id as number;
    this.selectedNote.text = formModel.text.trim() as string;
    this.selectedNote.itemId = this.notesRequest.itemId;
    this.selectedNote.itemType = this.notesRequest.itemType;
    this.selectedNote.modifiedBy = this.currentUser;

    return this.selectedNote;
  }

  getData(data: NotesRequest): void {
    this.notesRequest = data;
    this.getSourceData(data);
  }

  // used in other views when data must be collected from the service
  getSourceData(noteRequest: NotesRequest): void {
    this.isLoading$.next(true);
    this.noteService.getNotes(noteRequest.serviceType, noteRequest.itemType, noteRequest.itemId).subscribe(
      notes => {
        if (notes) {
          this.dataSource.data = notes;
          this.isLoading$.next(false);
        } else {
          this.isLoading$.next(false);
        }
      });
  }

  setupDisplayColumns(): void {
    this.columns = [
      { columnDefinition: 'note', header: 'Note', cell: (row: Note) => row.text },
      { columnDefinition: 'username', header: 'User', cell: (row: Note) => row.createdBy },
      {
        columnDefinition: 'date', header: 'Created', cell:
          (row: Note) => this.datePipe.transform(row.modifiedDate, 'yyyy/MM/dd hh:mm:ss')
      }
    ];
  }

  onselectIndex(item: any, obj): void {
    this.onSelect(item);
  }

  onSelect(item: any): void {
    this.mode = 'edit';
    this.individualLoading = true;
    this.selectedNote = null;
    this.checkUserAddPermission();
    if (item.id <= 0 || this.isWizard) { // if not saved , jumnped to tab
      this.selectedNote = item;
      this.getDisplayName();
      this.setForm(this.selectedNote);
      // ok.. so if the SAME user edits his own note, then enable it.
      if (this.selectedNote.createdBy !== this.currentUser) {
        this.form.disable();
      }
      this.individualLoading = false;
      this.hidetheLabelWhoAdded();
    } else {
      this.selectedNote = item;
      this.showLabelForLabelAdded = true;
      this.getDisplayName();
      this.setForm(this.selectedNote);
      this.form.disable();
      this.individualLoading = false;
    }
  }

  hidetheLabelWhoAdded(): void {
    this.selectedNote.createdBy !== '' ? this.showLabelForLabelAdded = true : this.showLabelForLabelAdded = false;
  }

  getDisplayName(): void {
    if (this.selectedNote.createdBy === this.currentUser) {
      this.displayNameForOnScreen = 'you';
    } else {
      this.userService.getUserDetails(this.selectedNote.createdBy).subscribe(user => {
        this.displayNameForOnScreen = user.displayName;
      });
    }
  }

  edit(): void {
    this.form.enable();
  }

  back(): void {
    this.selectedNote = null;
    this.mode = 'view';
  }

  add(): void {
    this.form.enable();
    this.form.reset();
    this.mode = 'edit';
    this.selectedNote = new Note();
    this.showLabelForLabelAdded = false;
  }

  save(): void {
    if (this.form.invalid) { return; }
    this.isLoading$.next(true);
    const note = this.readForm();
    this.noteService.addNote(this.notesRequest.serviceType, note).subscribe(() => {
      this.done('added');
      this.isLoading$.next(false);
    });
  }

  done(action: string): void {
    this.mode = 'view';
    this.selectedNote = null;

    if (!this.isWizard) {
      this.alertService.success(`The note has been ${action}.`);
      this.getData(this.notesRequest);
    }
  }

  checkUserAddPermission(): void {
    if (this.requiresPermissions) {
      const permissions = this.authService.getCurrentUserPermissions();
      this.hasViewOnly = permissions.find(permission => permission.name === this.addPermission || permission.name === this.editPermission) != null;
    } else {
      this.hasViewOnly = true;
    }
  }

  getLookupControl(lookupName: string) {
    const component = this.multiSelectComponentChildren.find((child) => child.lookupName === lookupName);
    return component;
  }

  // used in the wizard if the data is available for use directly
  setNotesData(notes: Note[]): void {
    if (notes.length > 0) {
      of(notes).subscribe(data => {
        this.dataSource.data = data;
        this.isLoading$.next(false);
      },
        error => {
          this.isLoading$.next(false);
        });
    } else {
    }
  }
}

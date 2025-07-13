
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { CommonNotesSearchRequestDataSource } from './common-notes-search-request-data-source';
import { CommonNotesService } from 'projects/shared-services-lib/src/lib/services/common-notes.service';
import { CommonNote } from 'projects/shared-models-lib/src/lib/common/common-note';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteCategoryEnum } from 'projects/shared-models-lib/src/lib/enums/note-category-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { NoteTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-type-enum';
import { isNullOrUndefined } from 'util';
import { debounceTime } from 'rxjs/operators';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { MatDialog } from '@angular/material/dialog';
import { CommonNoteViewDialogComponent } from './common-note-view-dialog/common-note-view-dialog.component';
import { CrudActionType } from 'projects/medicare/src/app/shared/enums/crud-action-type';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DefaultConfirmationDialogComponent } from '../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';

@Component({
  selector: 'common-notes',
  templateUrl: './common-notes.component.html',
  styleUrls: ['./common-notes.component.css']
})
export class CommonNotesComponent extends PermissionHelper implements OnInit {

  @Input() moduleType: ModuleTypeEnum[]; // required: for context i.e the module you are looking at the notes from
  @Input() moduleTypesExternalUser: ModuleTypeEnum[]; // optional: when a user is external and wants to add a note developer can set and lock the modules

  @Input() noteItemType: NoteItemTypeEnum; // required: the item context
  @Input() itemId: number; // required: the id of the item context

  @Input() noteType: NoteTypeEnum; // optional: if you want to filter only on the note type in a given context else all contexts will be available and displayed
  @Input() noteCategory: NoteCategoryEnum; // optional: if you want to filter only on the note category in a given context else all contexts will be available and displayed
  
  @Input() isReadOnly = false; // optional: force readonly, is not readonly by default

  @Output() noteCapturedEmit: EventEmitter<boolean> = new EventEmitter(); // emits when a note is captured
  @Output() CapturedNoteEmit: EventEmitter<number> = new EventEmitter(); // emits when a note is captured
  @Output() DeletedNoteEmit: EventEmitter<number> = new EventEmitter(); // emits when a note is deleted
  
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: CommonNotesSearchRequestDataSource;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  form: any;

  crudActionType = CrudActionType;
  searchTerm = '';
  selectedNote: CommonNote;
  
  noteItemTypeList: NoteItemTypeEnum[];
  noteTypeList: NoteTypeEnum[];
  filteredNoteTypeList: NoteTypeEnum[] = [];
  noteCategoryList: NoteCategoryEnum[];
  moduleTypeList: ModuleTypeEnum[];

  itemIdPreviousValue: number

  constructor(
    private readonly commonNotesService: CommonNotesService,
    private readonly authService: AuthService,
    private readonly formBuilder: FormBuilder,
    public dialog: MatDialog

  ) {
    super();
    this.dataSource = new CommonNotesSearchRequestDataSource(
      this.commonNotesService
    );
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    this.getData();
  }

  ngOnInit() {
    this.createForm();
    this.configureSearch();
    this.getLookups();
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      moduleTypeFilter: [{ value: null, disabled: false }],
      noteCategoryFilter: [{ value: null, disabled: false }],
      noteTypeFilter: [{ value: null, disabled: false }],
      noteItemTypeFilter: [{ value: null, disabled: false }],
      searchTerm: [{ value: null, disabled: false }]
    });
  }

  configureSearch() {
    this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
      this.search(response as string);
    });
  }

  getLookups() {
    this.noteItemTypeList = this.ToArray(NoteItemTypeEnum);
    this.noteTypeList = this.ToArray(NoteTypeEnum);
    this.filteredNoteTypeList = this.ToArray(NoteTypeEnum).sort((a, b) => {
      const formattedA = this.formatLookup(a).toLowerCase();
      const formattedB = this.formatLookup(b).toLowerCase();
      return formattedA < formattedB ? -1 : formattedA > formattedB ? 1 : 0;
  });
    this.noteCategoryList = this.ToArray(NoteCategoryEnum);
    this.moduleTypeList = this.ToArray(ModuleTypeEnum);

    this.getData();
  }

  search(searchTerm: string) {
    this.searchTerm = searchTerm;
    if (!this.searchTerm || this.searchTerm === '') {
      this.getData();
    } else {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.getData();
    }
  }

  getData() {
    this.dataSource.itemId = this.itemId;
    this.dataSource.noteItemType = this.noteItemType;
    this.dataSource.noteType = !isNullOrUndefined(this.noteType) ? this.noteType : null;
    this.dataSource.noteCategory = this.noteCategory;
    this.dataSource.moduleType = this.moduleType;
    this.dataSource.text = this.searchTerm;

    this.dataSource.getData(
      this.paginator.pageIndex + 1,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction,
      ''
    );

    this.isLoading$.next(false);
  }

  moduleTypeFilterChanged($event: ModuleTypeEnum) {
    let val: any[] = this.moduleType;
    val.push(+ModuleTypeEnum[$event]);
    this.dataSource.moduleType = [];
    this.dataSource.moduleType = val;
    this.dataSource.getData()
  }

  noteCategoryTypeFilterChanged($event: NoteCategoryEnum) {
    this.dataSource.noteCategory = +NoteCategoryEnum[$event];
    this.dataSource.getData()
  }

  noteTypeFilterChanged($event: NoteTypeEnum) {
    this.dataSource.noteType = +NoteTypeEnum[$event];
    this.dataSource.getData()
  }

  noteItemTypeFilterChanged($event: NoteItemTypeEnum) {
    this.dataSource.noteItemType = +NoteItemTypeEnum[$event];
    this.dataSource.getData()
  }

  formatEnum(value: number, enumeration: any): boolean {
    return enumeration[value];
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  reset() {
    this.isLoading$.next(true);

    this.searchTerm = null;
    this.selectedNote = null;

    this.form.controls.moduleTypeFilter.reset()
    this.form.controls.noteCategoryFilter.reset()
    this.form.controls.noteTypeFilter.reset()
    this.form.controls.noteItemTypeFilter.reset()
    this.form.controls.searchTerm.reset()

    this.form.patchValue({
      searchTerm: this.searchTerm
    });
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'text', show: true },
      { def: 'createdBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 5 },
      { def: 'createdByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 5 },
      { def: 'noteCategory', show: true },
      { def: 'createdDate', show: true },
      { def: 'noteType', show: true },      
      { def: 'actions', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  onNoteTypeKeyChange(value) {
    this.filteredNoteTypeList = this.dropDownSearch(value, 'noteType');
  }

  dropDownSearch(value: string, name: string) {
    let filter = value.toLowerCase();

    switch (name) {
      case 'noteType':
        return this.setData(filter, this.filteredNoteTypeList, this.noteTypeList);
      default: break;
    }
  }

  setData(filter: string, filteredList: any, originalList: any) {
    if (String.isNullOrEmpty(filter)) {
      return filteredList = originalList;
    }
    else {
      return filteredList.filter(item => item.toLocaleLowerCase().includes(filter));
    }
  }

  openConfirmationDialog(row: CommonNote) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Delete notes?',
        text: `Are you sure you want to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading$.next(true);
        row.isActive = false;
        row.isDeleted = true
        this.commonNotesService.editNote(row).subscribe(_ => {
          this.DeletedNoteEmit.emit(row.id);
          this.getData();
        });
      }
    });
  }

  openNoteDialog(actionType: CrudActionType, note: CommonNote) {
    let data = {
      selectedCommonNote: (actionType == CrudActionType.read || actionType == CrudActionType.update || actionType == CrudActionType.edit) ? note : null,
      selectedActionType: actionType,
      selectedModuleType: this.moduleTypesExternalUser?.length > 0 ? this.moduleTypesExternalUser : this.moduleType,
      noteCategory: this.noteCategory,
      noteItemType: this.noteItemType,
      itemId: this.itemId,
      isReadOnly: this.isReadOnly
    };

    const dialogRef = this.dialog.open(CommonNoteViewDialogComponent, {
      width: '50%',
      maxHeight: '700px',
      disableClose: true,
      data: data
    });

    dialogRef.afterClosed().subscribe((result: { noteResult: CommonNote, actionTypeResult: CrudActionType }) => {
      if (result) {
        if (result.actionTypeResult == CrudActionType.create) {
          this.isLoading$.next(true);
          this.commonNotesService.addNote(result.noteResult).subscribe((result) => {
            this.noteCapturedEmit.emit(true);
            this.CapturedNoteEmit.emit(result);
            this.getData();
          });
        }
        else if (result.actionTypeResult == CrudActionType.edit) {
          this.isLoading$.next(true);
          this.commonNotesService.editNote(result.noteResult).subscribe((result) => {
            this.getData();
          });
        }
        else if (result.actionTypeResult == CrudActionType.read) {
          this.getData();
        }
      }
    });
  }

  getNoteType(noteType: NoteTypeEnum): string {
    return this.formatLookup(NoteTypeEnum[noteType])
  }

  getNoteCategory(noteCategory: NoteCategoryEnum): string {
    return this.formatLookup(NoteCategoryEnum[noteCategory])
  }

  canCurrentUserEditNote(commonNote: CommonNote): boolean {
    const currentUser = this.authService.getCurrentUser();
    return commonNote.createdBy.toLowerCase() == currentUser.email.toLowerCase();
  }
}

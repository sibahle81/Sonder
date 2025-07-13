import { Component, Inject } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "projects/shared-services-lib/src/lib/services/security/auth/auth.service";
import { User } from "projects/shared-models-lib/src/lib/security/user";
import { CommonNoteModule } from "projects/shared-models-lib/src/lib/common/common-note-module";
import { ModuleTypeEnum } from "projects/shared-models-lib/src/lib/enums/module-type-enum";
import { NoteCategoryEnum } from "projects/shared-models-lib/src/lib/enums/note-category-enum";
import { NoteItemTypeEnum } from "projects/shared-models-lib/src/lib/enums/note-item-type-enum";
import { NoteTypeEnum } from "projects/shared-models-lib/src/lib/enums/note-type-enum";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CommonNote } from "projects/shared-models-lib/src/lib/common/common-note";
import { CrudActionType } from "projects/medicare/src/app/shared/enums/crud-action-type";
import { isNullOrUndefined } from "util";
import { CommonNotesSearchRequestDataSource } from "../common-notes-search-request-data-source";
import { CommonNotesService } from "projects/shared-services-lib/src/lib/services/common-notes.service";

@Component({
  templateUrl: "./common-note-view-dialog.component.html",
  styleUrls: ["./common-note-view-dialog.component.css"],
})
export class CommonNoteViewDialogComponent {
  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  moduleTypes: ModuleTypeEnum[];
  noteItemTypes: NoteItemTypeEnum[];
  noteTypes: NoteTypeEnum[];
  noteCategoryTypes: NoteCategoryEnum[];
  filteredNoteTypeList: NoteTypeEnum[] = [];
  noteTypeList: NoteTypeEnum[];

  currentUser: User;
  note: CommonNote;

  selectedCommonNote: CommonNote;
  selectedActionType: CrudActionType;
  selectedModuleType: ModuleTypeEnum[] = [];
  noteCategory: NoteCategoryEnum;
  noteItemType: NoteItemTypeEnum;
  itemId: number;
  isReadOnly: boolean;

  dataSource: CommonNotesSearchRequestDataSource;

  public crudActionType: typeof CrudActionType = CrudActionType;

  constructor(
    private readonly authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    private commonNotesService: CommonNotesService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CommonNoteViewDialogComponent>
  ) {
    this.currentUser = this.authService.getCurrentUser();

    if (data) {
      this.selectedCommonNote = data?.selectedCommonNote;
      this.selectedActionType = data?.selectedActionType;
      this.selectedModuleType = data?.selectedModuleType;
      this.noteCategory = data?.noteCategory;
      this.noteItemType = data?.noteItemType;
      this.itemId = data?.itemId;
      this.isReadOnly = data?.isReadOnly;
    }
    this.dataSource = new CommonNotesSearchRequestDataSource(this.commonNotesService);
  }

  onSave() {
    this.note = this.readForm();
    this.dialogRef.close({
      noteResult: this.note,
      actionTypeResult: this.selectedActionType,
    });
  }

  onClose() {
    this.dialogRef.close(null);
  }

  ngOnInit(): void {
    this.getLookups();
    this.createForm();
  }

  getLookups() {
    this.moduleTypes = this.ToArray(ModuleTypeEnum);
    this.noteTypes = this.ToArray(NoteTypeEnum);
    this.noteTypeList = this.ToArray(NoteTypeEnum);

    this.filteredNoteTypeList = this.ToArray(NoteTypeEnum).sort((a, b) => {
      const formattedA = this.formatLookup(a).toLowerCase();
      const formattedB = this.formatLookup(b).toLowerCase();
      return formattedA < formattedB ? -1 : formattedA > formattedB ? 1 : 0;
    });
    this.noteCategoryTypes = this.ToArray(NoteCategoryEnum);
  }

  createForm() {
    this.form = this.formBuilder.group({
      noteModules: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      noteCategory: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      noteType: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      noteText: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
    });

    this.setForm();
  }

  setForm() {
    let noteModulesPreselected: any[] = [];

    if (
      this.selectedActionType == CrudActionType.read ||
      this.selectedActionType == CrudActionType.edit
    ) {
      noteModulesPreselected = this.selectedCommonNote.noteModules.map(
        (x) => ModuleTypeEnum[+x.moduleType]
      );

      const formValues = {
        noteModules:
          this.selectedCommonNote.noteModules.length > 0
            ? noteModulesPreselected
            : [],
        noteCategory: this.selectedCommonNote.noteCategory
          ? NoteCategoryEnum[+this.selectedCommonNote.noteCategory]
          : null,
        noteType: this.selectedCommonNote.noteType
          ? NoteTypeEnum[+this.selectedCommonNote.noteType]
          : null,
        noteText: !isNullOrUndefined(this.selectedCommonNote.text?.length)
          ? this.selectedCommonNote.text
          : "N/A",
      };

      this.form.patchValue(formValues);

      if (this.selectedActionType == CrudActionType.read || this.isReadOnly) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    }

    if (this.selectedActionType == CrudActionType.create) {
      noteModulesPreselected = this.selectedModuleType.map(
        (x) => ModuleTypeEnum[+x]
      );

      const formValues = {
        noteModules:
          this.selectedModuleType.length > 0 ? noteModulesPreselected : [],
        noteCategory: this.noteCategory
          ? NoteCategoryEnum[+this.noteCategory]
          : null,
        noteType: this.noteItemType ? NoteTypeEnum[+this.noteItemType] : null,
      };

      this.form.patchValue(formValues);
      this.enableForm();
    }

    this.isLoading$.next(false);
  }

  disableForm() {
    this.form.controls.noteModules.disable();
    this.form.controls.noteCategory.disable();
    this.form.controls.noteType.disable();
    this.form.controls.noteText.disable();
  }

  enableForm() {
    if(this.currentUser.isInternalUser) {
      this.form.controls.noteModules.enable();
    } else {
      this.form.controls.noteModules.disable();
    }
    
    this.form.controls.noteCategory.enable();
    this.form.controls.noteType.enable();
    this.form.controls.noteText.enable();
  }

  ToArray(anyEnum: { [x: string]: any }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map((key) => anyEnum[key])
      .sort();
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, "$1 $2");
  }

  readForm(): CommonNote {
    let allowedCommonNoteModules: CommonNoteModule[] = [];
    let commonNote = new CommonNote();

    if (this.selectedActionType == CrudActionType.create) {
      //note that capturing module use included by default by selectedModuleType property
      for (
        let index = 0;
        index <= this.form.controls.noteModules.value.length;
        index++
      ) {
        const element = this.form.controls.noteModules.value[index];
        const commonNoteModule = new CommonNoteModule();
        commonNoteModule.moduleType =
          index == this.form.controls.noteModules.value.length &&
            this.selectedModuleType.length > 0
            ? this.selectedModuleType[0]
            : +ModuleTypeEnum[element];
        commonNoteModule.isActive = true;
        commonNoteModule.isDeleted = false;
        commonNoteModule.createdBy = this.authService.getUserEmail();
        commonNoteModule.createdDate = new Date();
        commonNoteModule.modifiedBy = this.authService.getUserEmail();
        commonNoteModule.modifiedDate = new Date();
        allowedCommonNoteModules.push(commonNoteModule);
      }

      //unique moduleType only
      const uniqueAllowedModules = allowedCommonNoteModules.filter(
        (obj, index) => {
          return (
            index ===
            allowedCommonNoteModules.findIndex(
              (o) => obj.moduleType === o.moduleType
            )
          );
        }
      );

      (commonNote.itemId = this.itemId > 0 ? this.itemId : 0),
        (commonNote.noteItemType = this.noteItemType);
      commonNote.text = this.form.controls.noteText.value;
      commonNote.noteType = this.form.controls.noteType.value;
      commonNote.noteCategory = this.form.controls.noteCategory.value;

      (commonNote.isActive = true),
        (commonNote.isDeleted = false),
        (commonNote.createdBy = this.authService.getUserEmail());
      commonNote.createdDate = new Date();
      commonNote.modifiedBy = this.authService.getUserEmail();
      commonNote.modifiedDate = new Date();

      commonNote.noteModules = uniqueAllowedModules;
    } else if (this.selectedActionType == CrudActionType.edit) {
      commonNote.id =
        this.selectedCommonNote.id > 0 ? this.selectedCommonNote.id : 0;
      commonNote.itemId =
        this.selectedCommonNote.itemId > 0 ? this.selectedCommonNote.itemId : 0;
      commonNote.noteItemType = this.form.controls.noteText.value
        ? this.selectedCommonNote.noteItemType
        : null;
      commonNote.text = this.form.controls.noteText.value
        ? this.form.controls.noteText.value
        : null;
      commonNote.noteType = this.form.controls.noteType.value
        ? this.form.controls.noteType.value
        : null;
      commonNote.noteCategory = this.form.controls.noteCategory.value
        ? this.form.controls.noteCategory.value
        : null;
      commonNote.modifiedBy = this.authService.getUserEmail();
      commonNote.modifiedDate = new Date();
    }
    return commonNote;
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
      const result = filteredList.filter(item => item.toLocaleLowerCase().includes(filter));
      return result;
    }
  }

  noteTypeFilterChanged($event: NoteTypeEnum) {
    this.dataSource.noteType = +NoteTypeEnum[$event];
  }
}

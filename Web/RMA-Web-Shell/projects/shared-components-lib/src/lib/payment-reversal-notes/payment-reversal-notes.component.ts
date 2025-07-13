import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { NotesComponent } from 'projects/shared-components-lib/src/lib/notes/notes.component';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BehaviorSubject } from 'rxjs';
import { PaymentReversalReasonsEnum } from 'projects/shared-models-lib/src/lib/enums/payment-reversal-reasons-enum';
import { CommonNotesService } from 'projects/shared-services-lib/src/lib/services/common-notes.service';
import { CommonNote } from 'projects/shared-models-lib/src/lib/common/common-note';
import { CommonNoteModule } from 'projects/shared-models-lib/src/lib/common/common-note-module';
import { NoteCategoryEnum } from 'projects/shared-models-lib/src/lib/enums/note-category-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { NoteTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-type-enum';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';

@Component({
  selector: 'payment-reversal-notes',
  templateUrl: './payment-reversal-notes.component.html',
  styleUrls: ['./payment-reversal-notes.component.css']
})
export class PaymentReversalNotesComponent implements OnInit {
  documentType: DocumentType;
  keys: { [key: string]: string };

  public isNoteLoading : boolean;

  allowedDocumentTypes: string;
  message: string;
  reversalReason : string;
  reversalDetail : string;
  form: any;
  isLoading = false;
  @ViewChild(NotesComponent, { static: false }) noteComponent: NotesComponent;

  reversalReasons: PaymentReversalReasonsEnum[];
  
  constructor(
    public dialogRef: MatDialogRef<PaymentReversalNotesComponent>,
    public dialog: MatDialog,
    private readonly noteService: NotesService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastr: ToastrManager,   
    private readonly alertService: AlertService,
    private readonly commonNotesService: CommonNotesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {    
    this.createForm();
    this.reversalReasons = this.ToArray(PaymentReversalReasonsEnum);
  
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  paymentReasonChanged($event: any) {
    this.reversalReason = $event.value;
  }

  saveNote() {   
    this.reversalDetail = this.readForm(); 
    if (this.reversalDetail == null || this.reversalDetail == '') {
      this.toastr.errorToastr('Reversal reason details cannot be empty.');      
      return;
    }  
    if (this.reversalReason == null || this.reversalReason == '') {
      this.toastr.errorToastr('Reversal reason cannot be empty.');      
      return;
    }   
    this.isNoteLoading = false; 

    this.addNote(); 
    
    this.isNoteLoading = true; 
  }

  addNote() {
    const commonSystemNote = new CommonNote();
    commonSystemNote.itemId = this.data.personEventId;
    commonSystemNote.noteCategory = NoteCategoryEnum.PersonEvent;
    commonSystemNote.noteItemType = NoteItemTypeEnum.PersonEvent;
    commonSystemNote.noteType = NoteTypeEnum[this.reversalReason as keyof typeof NoteTypeEnum]; 
    commonSystemNote.text = this.reversalDetail;
    commonSystemNote.isActive = true;

    commonSystemNote.noteModules = [];
    const moduleType = new CommonNoteModule();
    moduleType.moduleType = ModuleTypeEnum.ClaimCare;
    commonSystemNote.noteModules.push(moduleType);

    this.commonNotesService.addNote(commonSystemNote).subscribe(result => {  
      this.dialogRef.close(commonSystemNote);  
      this.toastr.successToastr('Note saved.');     
    });
  }

  createForm() {
    this.form = this.formBuilder.group({
      message: new UntypedFormControl('')
    });   
  }

  readForm(): string {
    const formModel = this.form.value;
    this.message = formModel.message;
    return this.message;
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
}

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

@Component({
  selector: 'payment-recall-notes',
  templateUrl: './payment-recall-notes.component.html',
  styleUrls: ['./payment-recall-notes.component.css']
})
export class PaymentRecallNotesComponent implements OnInit {
  documentType: DocumentType;
  keys: { [key: string]: string };

  public isNoteLoading : boolean;

  allowedDocumentTypes: string;
  message: string;
  recallReason : string;
  form: any;
  isLoading = false;
  @ViewChild(NotesComponent, { static: false }) noteComponent: NotesComponent;
 
  constructor(
    public dialogRef: MatDialogRef<PaymentRecallNotesComponent>,
    public dialog: MatDialog,
    private readonly noteService: NotesService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastr: ToastrManager,   
    private readonly alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {    
    this.createForm();
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  saveNote(): void {   
    this.recallReason = this.readForm(); 
    if (this.recallReason == null || this.recallReason == '') {
      this.toastr.errorToastr('Recall reason cannot be empty.');      
      return;
    }     
    this.isNoteLoading = false;   
    this.saveList(this.noteService, this.dialogRef, this.toastr);    
    this.isNoteLoading = true;  
  }

  saveList(service : NotesService, dialogRef : MatDialogRef<PaymentRecallNotesComponent>, toastr : ToastrManager) { 
    const reason = this.recallReason; 
    this.data.payments.forEach(function (p) {   
        const note = new Note();       
        note.itemId = p.paymentId;  
        note.text = reason;
        note.itemType = 'Payment Recall';       
        service.addNote(ServiceTypeEnum.PaymentManager, note).subscribe(() => {  
          dialogRef.close(note);  
          toastr.successToastr('Note saved.');      
        });      
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
}

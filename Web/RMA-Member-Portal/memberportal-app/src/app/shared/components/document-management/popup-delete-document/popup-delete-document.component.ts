import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServiceType } from 'src/app/shared/enums/service-type.enum';
import { Note } from 'src/app/shared/models/note.model';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ClaimCareService } from 'src/app/shared/services/claimcare.service';
import { NotesComponent } from '../../notes/notes.component';
import { NotesService } from '../../notes/notes.service';

@Component({
  selector: 'app-delete-upload-document',
  templateUrl: './popup-delete-document.component.html',
  styleUrls: ['./popup-delete-document.component.css']
})
export class PopupDeleteDocumentComponent implements OnInit {
  documentType: DocumentType;
  keys: { [key: string]: string };
  isUploading: boolean;
  allowedDocumentTypes: string;
  message: string;
  form: any;
  @ViewChild(NotesComponent) noteComponent: NotesComponent;
  constructor(
    public dialogRef: MatDialogRef<PopupDeleteDocumentComponent>,
    public dialog: MatDialog,
    private readonly formBuilder: FormBuilder,
    private readonly claimservice: ClaimCareService,
    private readonly noteService: NotesService,
    private readonly alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.isUploading = true;
    this.keys = this.data.documentRequest.keys;
    this.createForm();

  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }


  Add(): void {
    if (this.readForm().length === 0) {
      this.alertService.error('Please enter a reason');
    } else {
      const note = new Note();

      if (this.data && this.data.documentRequest && this.data.documentRequest.personEventId) {
        note.itemId = this.data.documentRequest.personEventId;
        note.text = this.readForm(),
          note.itemType = 'PersonEvent',
          this.noteService.addNote(ServiceType.ClaimManager, note).subscribe(() => this.dialogRef.close(note));
      } else {
        this.claimservice.GetClaim(this.data.documentRequest.claimId).subscribe(result => {
          note.itemId = result.personEventId;
          note.text = this.readForm(),
            note.itemType = 'PersonEvent',
            this.noteService.addNote(ServiceType.ClaimManager, note).subscribe(() => this.dialogRef.close(note));
        });
      }
    }
  }


  createForm() {
    this.form = this.formBuilder.group({
      message: new FormControl('')
    });
  }

  readForm(): string {
    const formModel = this.form.value;
    this.message = formModel.message;
    return this.message;
  }
}

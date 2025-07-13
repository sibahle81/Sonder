import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DocumentType } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/document-type.model';
import { UntypedFormControl, UntypedFormBuilder, FormGroup } from '@angular/forms';
import { NotesComponent } from '../../notes/notes.component';
import { NotesService } from '../../notes/notes.service';
import { Note } from '../../notes/note';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';

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
  @ViewChild(NotesComponent, { static: false }) noteComponent: NotesComponent;
  constructor(
    public dialogRef: MatDialogRef<PopupDeleteDocumentComponent>,
    public dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
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
          this.noteService.addNote(ServiceTypeEnum.ClaimManager, note).subscribe(() => this.dialogRef.close(note));
      } else {
        this.claimservice.GetClaim(this.data.documentRequest.claimId).subscribe(result => {
          note.itemId = result.personEventId;
          note.text = this.readForm(),
          note.itemType = 'PersonEvent',
          this.noteService.addNote(ServiceTypeEnum.ClaimManager, note).subscribe(() => this.dialogRef.close(note));
        });
      }
    }
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

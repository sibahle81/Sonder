import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PensCareNote } from '../../models/penscare-note';

@Component({
  selector: 'app-penscare-note',
  templateUrl: './penscare-note.component.html',
  styleUrls: ['./penscare-note.component.css']
})
export class PenscareNoteComponent implements OnInit {
  @Input() note: PensCareNote;
  @Input() mode: string;
  @Output() onSaveNote = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<PensCareNote>();
  form: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    if (this.form) { return;}
    this.form = this.formBuilder.group({
      title: new UntypedFormControl({value: this.note.title, disabled: this.mode === 'view' ? true : false}, [Validators.required]),
      text: new UntypedFormControl({value: this.note.text, disabled: this.mode === 'view' ? true : false}, [Validators.required]),
    })
  }

  saveNote() {
    if (this.form.valid) {
      const newNote = this.note;
      newNote.title = this.form.controls['title'].value;
      newNote.text = this.form.controls['text'].value;
      newNote.modifiedBy = this.authService.getCurrentUser().name;
      newNote.modifiedDate = new Date();
      newNote.createdBy = this.authService.getCurrentUser().name;
      newNote.createdDate = new Date();
      this.onSaveNote.emit(newNote);
    }
  }

  cancel() {
    this.onCancel.emit();
  }

}

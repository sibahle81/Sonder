import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BehaviorSubject } from 'rxjs';
import { AccidentService } from '../../Services/accident.service';

@Component({
  selector: 'app-remove-from-stp',
  templateUrl: './remove-from-stp.component.html',
  styleUrls: ['./remove-from-stp.component.css']
})
export class RemoveFromStpComponent implements OnInit {

  personEventId: number;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  noteMessage = new UntypedFormControl('', [Validators.required]);

  get hasError(): boolean {
    if (this.noteMessage) {
      if (this.noteMessage.touched) {
        return this.noteMessage.hasError('required');
      }
    }
    return false;
  }

  constructor(
    public dialog: MatDialogRef<RemoveFromStpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NotesRequest,
    private accidentService: AccidentService,
    private alertService: AlertService,
  ) {
    this.personEventId = this.data?.itemId;
  }

  ngOnInit(): void {
    this.clearMessage();
  }

  clearMessage(): void {
    this.noteMessage.setValue('');
    this.noteMessage.markAsUntouched();
    this.noteMessage.markAsPristine();
  }

  save(): void {
    if (!this.noteMessage.valid) {
      this.noteMessage.markAsTouched();
      return;
    }

    const note = new Note();
    note.itemType = this.data.itemType;
    note.itemId = this.data.itemId;
    note.text = this.noteMessage.value;

    this.isLoading$.next(true);
    this.accidentService.removePersonEventFromSTP(this.personEventId, note).subscribe({
      next: (result) => {
        this.dialog.close(result);
        this.alertService.success('Claim removed from STP queue successfully');
      },
      complete: () => {
        this.isLoading$.next(false);
      }
    });
  }

  cancel(): void {
    this.clearMessage();
    this.dialog.close(null);
  }
}

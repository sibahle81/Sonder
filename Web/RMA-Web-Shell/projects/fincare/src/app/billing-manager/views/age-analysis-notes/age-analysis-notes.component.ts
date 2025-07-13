import { Component, Inject } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AgeAnalysisService } from '../../../shared/services/age-analysis.service';
import { AgeAnalysisNote } from '../../../shared/models/age-analysis-note';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-age-analysis-notes',
  templateUrl: './age-analysis-notes.component.html',
  styleUrls: ['./age-analysis-notes.component.css']
})
export class AgeAnalysisNotesComponent {

  notes: AgeAnalysisNote[];
  section: string;
  savingNote = false;
  rolePlayerId: number;
  noteText = new UntypedFormControl('', [Validators.required, Validators.minLength(10)]);

  displayColumns = ['user', 'date', 'note'];

  constructor(
    public dialogRef: MatDialogRef<AgeAnalysisNotesComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly ageAnalysisService: AgeAnalysisService,
    private readonly alertService: AlertService,
    private readonly toastr: ToastrManager
  ) {
    this.rolePlayerId = data.rolePlayerId;
    this.section = data.section;
    this.notes = data.notes;
  }

  showSection(section: string): void {
    this.section = section;
  }

  saveNote(): void {
    if (!this.noteText.valid) { return; }

    this.savingNote = true;
    this.showSection('list');

    const note = new AgeAnalysisNote();
    note.id = 0;
    note.rolePlayerId = this.rolePlayerId;
    note.text = this.noteText.value;

    this.ageAnalysisService.saveNote(note).subscribe(
      data => {
        const list: AgeAnalysisNote[] = this.notes.splice(0, 2);
        list.unshift(data);
        this.notes = list;
        this.savingNote = false;
      },
      error => {
        this.toastr.errorToastr(error);
        this.savingNote = false;
      }
    );
  }

  closeDialog(): void {
    this.dialogRef.close({ notes: this.notes });
  }
}

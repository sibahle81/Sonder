import { Component, Inject } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AgeAnalysisNote } from 'projects/fincare/src/app/shared/models/age-analysis-note';
import { AgeAnalysisService } from 'projects/fincare/src/app/shared/services/age-analysis.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';


@Component({
  selector: 'app-age-analysis-notes',
  templateUrl: './recovery-age-analysis-notes.component.html',
  styleUrls: ['./recovery-age-analysis-notes.component.css']
})
export class RecoveryAgeAnalysisNotesComponent {

  notes: AgeAnalysisNote[];
  section: string;
  savingNote = false;
  rolePlayerId: number;
  noteText = new UntypedFormControl('', [Validators.required, Validators.minLength(10)]);

  displayColumns = ['user', 'date', 'note'];

  constructor(
    public dialogRef: MatDialogRef<RecoveryAgeAnalysisNotesComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly ageAnalysisService: AgeAnalysisService,
    private readonly alertService: AlertService
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
        this.alertService.error(error);
        this.savingNote = false;
      }
    );
  }

  closeDialog(): void {
    this.dialogRef.close({ notes: this.notes });
  }
}

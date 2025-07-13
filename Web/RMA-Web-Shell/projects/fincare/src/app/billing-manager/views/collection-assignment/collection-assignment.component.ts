import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AgeAnalysisService } from '../../../shared/services/age-analysis.service';
import { AgeAnalysisDatasource } from '../age-analysis/age-analysis.datasource';
import { CollectionAgent } from '../../../shared/models/collection-agent';
import { AgeAnalysis } from '../../../shared/models/age-analysis';
import { AgeAnalysisNote } from '../../../shared/models/age-analysis-note';
import { AgeAnalysisNotesComponent } from '../age-analysis-notes/age-analysis-notes.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AgeAnalysisRequest } from '../../../shared/models/age-analysis-request';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-collection-assignment',
  templateUrl: './collection-assignment.component.html',
  styleUrls: ['./collection-assignment.component.css']
})
export class CollectionAssignmentComponent extends WizardDetailBaseComponent<CollectionAgent> {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isLoading = true;

  displayedColumns = [
    'accountNumber',
    'clientName',
    'balance',
    'interest',
    'current',
    'balance30Days',
    'balance60Days',
    'balance90Days',
    'balance120Days',
    'balance120PlusDays',
    'notes'
  ];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly ageAnalysisService: AgeAnalysisService,
    private readonly alertService: AlertService,
    public datasource: AgeAnalysisDatasource,
    private dialogBox: MatDialog,
    private toastr: ToastrManager
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void { }

  createForm(id: number): void {
    this.datasource.setControls(this.paginator, this.sort);
  }

  populateForm(): void {
    this.isLoading = true;

    const ageAnalysysRequest = new AgeAnalysisRequest();
    ageAnalysysRequest.ageTypeId = this.model.ageTypeId as number;
    ageAnalysysRequest.assignedStatusId = this.model.assignedStatus as number;
    ageAnalysysRequest.balanceTypeId = this.model.balanceTypeId as number;
    ageAnalysysRequest.clientTypeId = this.model.clientTypeId as number;
    ageAnalysysRequest.debtorStatusId = this.model.debtorStatus as number;
    ageAnalysysRequest.endDate = new Date(this.model.endDate);
    ageAnalysysRequest.includeInterest = true;
    ageAnalysysRequest.includeNotes = true;

    this.ageAnalysisService.getAgeAnalysis(ageAnalysysRequest).subscribe(results => {
      this.datasource.getData(results.filter(ageAnalysis => ageAnalysis.collectionAgent === this.model.agent.email && this.model.accountIds.indexOf(ageAnalysis.accountId) >= 0));
      this.isLoading = false;
    });
  }

  populateModel(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  getNotesLink(row: AgeAnalysis): string {
    let count = 0;
    if (row.note1 && row.note1 !== '') { count++; }
    if (row.note2 && row.note2 !== '') { count++; }
    if (row.note3 && row.note3 !== '') { count++; }
    switch (count) {
      case 0: return '';
      case 1: return '1 note';
      default: return `${count} notes`;
    }
  }

  addNote(row: AgeAnalysis): void {
    this.showAgeAnalysisNotes(row, 'add');
  }

  showNotes(row: AgeAnalysis): void {
    this.showAgeAnalysisNotes(row, 'list');
  }

  showAgeAnalysisNotes(row: AgeAnalysis, section: string) {
    const notes: AgeAnalysisNote[] = [
      { id: row.noteId1, rolePlayerId: row.accountId, createdBy: row.user1, createdDate: row.date1, text: row.note1 } as AgeAnalysisNote,
      { id: row.noteId2, rolePlayerId: row.accountId, createdBy: row.user2, createdDate: row.date2, text: row.note2 } as AgeAnalysisNote,
      { id: row.noteId3, rolePlayerId: row.accountId, createdBy: row.user3, createdDate: row.date3, text: row.note3 } as AgeAnalysisNote
    ];

    const config = new MatDialogConfig();
    config.data = {
      section,
      rolePlayerId: row.accountId,
      notes: notes.filter(n => n.text && n.text !== '')
    };
    config.disableClose = true;
    const dialog = this.dialogBox.open(AgeAnalysisNotesComponent, config);
    dialog.afterClosed().subscribe(
      data => {
        if (data.notes && data.notes.length > 0) {
          for (let i = 0; i < data.notes.length; i++) {
            const note = data.notes[i];
            row[`noteId${i + 1}`] = note.id;
            row[`user${i + 1}`] = note.createdBy;
            row[`date${i + 1}`] = note.createdDate;
            row[`note${i + 1}`] = note.text;
          }
        }
      },
      error => {
        this.toastr.errorToastr(error);
        this.isLoading = false;
      }
    );
  }
}

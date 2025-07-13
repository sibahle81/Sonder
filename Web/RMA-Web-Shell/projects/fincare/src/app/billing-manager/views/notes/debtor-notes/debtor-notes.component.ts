import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BillingService } from '../../../services/billing.service';
import { MatTableDataSource } from '@angular/material/table';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { DebtorNoteTypeEnum } from 'projects/fincare/src/app/shared/enum/debtor-note-type.enum';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DebtorNoteAddDialogComponent } from '../debtor-note-add-dialog/debtor-note-add-dialog.component';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ToastrManager } from 'ng6-toastr-notifications';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { Constants } from '../../../constants';

@Component({
  selector: 'app-debtor-notes',
  templateUrl: './debtor-notes.component.html',
  styleUrls: ['./debtor-notes.component.css']
})
export class DebtorNotesComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading = false;
  displayedColumns = ['itemType', 'text', 'createdBy', 'createdDate', 'createdTime'];
  currentQuery: string;
  datasource = new MatTableDataSource<Note>();
  noteTypes: { id: number, name: string }[];
  selectedNoteType: DebtorNoteTypeEnum;
  billingServiceSubscription: Subscription;
  form: UntypedFormGroup;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  errorMessage: string;
  roleplayerId = 0;
  isSubmitting = false;
  coidFeaturesDisabled = FeatureflagUtility.isFeatureFlagEnabled(Constants.billingDisableCoidFeatureFlag);
  constructor(private readonly dialog: MatDialog,
    private readonly billingService: BillingService, private readonly formBuilder: UntypedFormBuilder, private readonly toastr: ToastrManager,) {
  }
  ngOnDestroy(): void {
    this.billingServiceSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.createForm();
    this.noteTypes = this.ToKeyValuePair(DebtorNoteTypeEnum);
    const coidTypesToExclude = [+DebtorNoteTypeEnum.TermsArrangement, +DebtorNoteTypeEnum.UnsuccessfulTerm, +DebtorNoteTypeEnum.TermMissedPayment,
    +DebtorNoteTypeEnum.TermInadquatePayment, +DebtorNoteTypeEnum.TermArrears, +DebtorNoteTypeEnum.InterestReversal,
    +DebtorNoteTypeEnum.InterestAdjustment, +DebtorNoteTypeEnum.BadDebtWriteOff, +DebtorNoteTypeEnum.BadDebtReinstate,
    +DebtorNoteTypeEnum.InterestReinstate, +DebtorNoteTypeEnum.InterestWriteOff, +DebtorNoteTypeEnum.AdhocInterest, +DebtorNoteTypeEnum.PremiumWriteOff
   ,+DebtorNoteTypeEnum.Collection]
    this.noteTypes  = [...this.noteTypes].filter(c => !coidTypesToExclude.includes(c.id));
    this.billingServiceSubscription = this.billingService.selectedRoleplayerId$.subscribe(data => {
      if (data) {
        this.getRoleplayerNotes(data);
        this.roleplayerId = data
      }
    });
  }

  createForm() {
    this.form = this.formBuilder.group({
      noteType: [null],
    });
  }

  getRoleplayerNotes(rolePlayerId) {
    this.billingService.getBillingNotesByRoleplayerId(rolePlayerId).subscribe(
      data => {
        if (data && data.length > 0) {
          this.datasource.data = [...data].sort((a, b) => a.itemType.localeCompare(b.itemType));
        }
      }
    );
  }

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums)
      .filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  splitPascalCaseWord(word: string): string {
    const regex = /($[a-z])|[A-Z][^A-Z]+/g;
    return word.match(regex).join(' ');
  }

  openDialog(): void {
    this.errorMessage = '';
    if (!(+this.selectedNoteType > 0)) {
      this.errorMessage = 'Please select a note type to add';
      return;
    }

    const dialogRef = this.dialog.open(DebtorNoteAddDialogComponent, { width: '600px', height: '600px', data: { noteType: DebtorNoteTypeEnum[this.selectedNoteType] } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.note && result.note.length > 0) {
        let note = new Note();
        note.text = result.note;
        note.itemType = DebtorNoteTypeEnum[this.selectedNoteType];
        note.itemId = this.roleplayerId;
        this.submitNote(note);
      }
    });
  }

  filter() {
    this.billingService.getBillingNotesByRoleplayerIdAndType(this.roleplayerId, this.selectedNoteType).subscribe(
      data => {
        if (data && data.length > 0) {
          this.datasource.data = [...data].sort((a, b) => a.itemType.localeCompare(b.itemType));
        }
        else {
          this.datasource.data = [];
          this.errorMessage = `No notes found for ${this.splitPascalCaseWord(DebtorNoteTypeEnum[+this.selectedNoteType])}`
        }
      }
    );
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  noteTypeChanged(event: any) {
    this.errorMessage = '';
  }

  submitNote(note: Note) {
    this.isSubmitting = true;
    this.billingService.addNote(note).subscribe(data => {
      this.isSubmitting = false;
      this.toastr.successToastr('Note successfully added.', '', true);
      this.getRoleplayerNotes(this.roleplayerId);
    },
      error => {
        this.isSubmitting = false;
        this.toastr.errorToastr('error occured trying to add note.', '', true);
      });
  }
}

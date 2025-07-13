import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog'; 
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TermsArrangementNoteDataSource } from './terms-arrangement-notes.datasource';
import { TermsArrangementNote } from 'projects/fincare/src/app/billing-manager/models/term-arrangement-note';
import { TermArrangementService } from 'projects/fincare/src/app/shared/services/term-arrangement.service';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { TermNoteTypeEnum } from 'projects/shared-models-lib/src/lib/enums/term-note-type-enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

  @Component({
    selector: 'term-arrangement-note',
    templateUrl: './terms-arrangement-notes.component.html',
    styleUrls: ['./terms-arrangement-notes.component.css']
  })
  export class TermsArrangementNotesComponent implements OnChanges,  OnInit {

  @Input()  termArrangementId: number;
  @Input()  itemId: number;
  @Input()  itemType: string;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['text', 'createdBy', 'createdDate', 'modifiedBy', 'modifiedDate', 'actions'];

  form: UntypedFormGroup;
    dataSource: TermsArrangementNoteDataSource;
  currentQuery: any;
  currentUser: string;
    selectedNote: TermsArrangementNote;
    noteTypes: { id: number, name: string }[];
    selectedNoteTypeId: number;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showForm$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showDetail$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  requiredAuditPermission = 'View Audits';
  hasAuditPermission = true;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly memberService: MemberService,
    private readonly termArrangementService: TermArrangementService,
    public dialog: MatDialog
  ) { }
  
ngOnInit(){
  this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
  this.createForm();
  this.noteTypes = this.ToKeyValuePair(TermNoteTypeEnum);
  this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
  this.dataSource = new TermsArrangementNoteDataSource(this.termArrangementService);
this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
  this.currentQuery = this.termArrangementId.toString();
this.getData();
  
}
  ngOnChanges(changes: SimpleChanges): void {
    if (this.termArrangementId) {
      this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
      this.createForm();
      this.noteTypes = this.ToKeyValuePair(TermNoteTypeEnum);
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new TermsArrangementNoteDataSource(this.termArrangementService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.termArrangementId.toString();
    this.getData();
  }
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

getData() {
  this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
}

    view(termArrangementNote: TermsArrangementNote) {
      this.selectedNote = termArrangementNote;
  this.showDetail$.next(true);
}

close() {
  this.showDetail$.next(false);
  this.showForm$.next(false);
  this.reset();
}

createForm() {
  if (!this.form) {
    this.form = this.formBuilder.group({
      text: [{ value: null, disabled: false }, [Validators.required]],
      noteType: [{ value: null, disabled: false }, [Validators.required]]
    });
  }
}

    setForm(termArrangementNote: TermsArrangementNote) {
  this.form.patchValue({
    text: termArrangementNote.text ? termArrangementNote.text : null
  });
}

    readForm(): TermsArrangementNote {
  const termArrangementNote = new TermsArrangementNote();

      termArrangementNote.id = this.selectedNote && this.selectedNote.id && this.selectedNote.id > 0 ? this.selectedNote.id : 0; 
      termArrangementNote.termArrangementId = this.termArrangementId;
      termArrangementNote.itemType = this.selectedNoteTypeId;
      termArrangementNote.itemId =  this.itemId;
      termArrangementNote.modifiedBy= this.currentUser;
      termArrangementNote.createdBy = this.currentUser;
      termArrangementNote.text = this.form.controls.text.value;

      return termArrangementNote; 
}

    showForm(termArrangementNote: TermsArrangementNote) {
      if (termArrangementNote) {
        this.selectedNote = termArrangementNote;
        this.setForm(termArrangementNote);
      }
      this.showForm$.next(true);
    }

save() {
  this.isLoading$.next(true);
  const termArrangementNote = this.readForm();
  if (termArrangementNote.termArrangementId > 0) {
    this.edit(termArrangementNote);
  } else {
    
    this.add(termArrangementNote);
  }
}

    add(termArrangementNote: TermsArrangementNote) {
      this.termArrangementService.AddTermArrangementNote(termArrangementNote).subscribe(result => {
    this.getData();
    this.reset();
    this.isLoading$.next(false);
    this.showForm$.next(false);
  });
}

    edit(termArrangementNote: TermsArrangementNote) {
      this.termArrangementService.AddTermArrangementNotes(termArrangementNote).subscribe(result => {
    this.getData();
    this.reset();
    this.isLoading$.next(false);
    this.showForm$.next(false);
  });
}

reset() {
  this.form.controls.text.reset();
  this.selectedNote = null;
}

currentUserCanEdit(termArrangementNote: TermsArrangementNote): boolean {
  const currentUser = this.authService.getCurrentUser();
  return termArrangementNote.createdBy === currentUser.email;
}

openAuditDialog(termArrangementNote: TermsArrangementNote) {
  const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
    width: '70%',
    data: {
      itemType: termArrangementNote.itemType,
      itemId: termArrangementNote.itemId,
      heading: 'Terms Arrangement Note Audit',
      propertiesToDisplay: ['Text']
    }
  });

}
}


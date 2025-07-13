import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { RegisterFuneralModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/register-funeral.model';
import { FuneralRuleResult } from '../../../shared/entities/funeral/funeral-rule-result';
import { ClaimReOpenReasonsModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim-cancellation-reasons.model';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { StatusType } from 'projects/claimcare/src/app/claim-manager/shared/enums/status.enum';
import { WorkPoolUpdateStatus } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { PersonEventType } from 'projects/claimcare/src/app/claim-manager/shared/enums/personEvent.enum';
import { PersonEventUpdateStatus } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model'

@Component({
  selector: 'app-close-claim',
  templateUrl: './close-claim.component.html',
  styleUrls: ['./close-claim.component.css']
})

export class CloseClaimComponent extends DetailsComponent implements OnInit {
  selectedFilterTypeId = 0;
  claimReOpenReasons: ClaimReOpenReasonsModel[];
  claimId: any;
  personEventId: any;
  policyId: any;
  isProcessing: boolean;
  isLoading: boolean;
  ruleResult: FuneralRuleResult;
  ruleResultMessages: string[];
  registerFuneralModel = new RegisterFuneralModel();
  errorMessages: any[];
  messages: any;
  selectedNote: Note;
  currentUser: User;
  currentUserEmail: string;
  notesRequest: NotesRequest;
  selectedReOpenReason: string;
  statusEnum = StatusType;
  personEventType = PersonEventType;
  disabled = false;

  constructor(
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly router: Router,
    dateAdapter: DateAdapter<NativeDateAdapter>,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimCareService: ClaimCareService,
    private readonly authService: AuthService,
    private readonly notesService: NotesService) {
    super(appEventsManager, alertService, router, '', '', 1);
    dateAdapter.setLocale('en-za');
    this.ruleResultMessages = new Array();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.claimId = params.id;
      this.personEventId = params.personEventId;
      this.policyId = params.policyId;
      this.currentUser = this.authService.getCurrentUser();
      this.currentUserEmail = this.currentUser.email;
      if(this.claimId != 'null'){
        this.getClaimDetail(this.claimId);
      }
      else{
        this.getPersonEventDetail(this.personEventId);
      }
      this.createForm(params.id);
    });
  }

  createForm(id: any): void {
    this.clearDisplayName();
    this.form = this.formBuilder.group({
      id,
      beneficiaries: new UntypedFormControl(''),
      text: ['', [Validators.required, Validators.minLength(3)]],
      filter: new UntypedFormControl(''),
    });
  }

  patchBankingForm() {
    this.form.patchValue({
      // bank: this.selectedBankAccountforEdit.bankId,
    });
  }

  selectedReasonChanged($event: any) {
    const target = $event.source.selected._element.nativeElement;
    const selectedData = {
      value: $event.value,
      text: target.innerText.trim()
    };
    this.selectedReOpenReason = selectedData.text;
  }

  readForm(): Note {
    const formModel = this.form.value;
    this.selectedNote = new Note();
    this.selectedNote.reason = this.selectedReOpenReason;
    this.selectedNote.text = formModel.text.trim();
    this.selectedNote.itemId = this.claimId;
    this.selectedNote.itemType = 'Claim';
    if(this.claimId == 'null'){
      this.selectedNote.itemId = this.personEventId;
      this.selectedNote.itemType = 'PersonEvent'
    }
    this.selectedNote.modifiedBy = this.currentUserEmail;
    return this.selectedNote;
  }

  getClaimDetail(id: number): void {
    this.appEventsManager.loadingStart(`Getting details...`);
    this.isLoading = true;
    this.claimCareService.GetFuneralRegistyDetailByClaimId(id).subscribe(
      detail => {

        // Get the Rule results :
        this.registerFuneralModel.claimId = id;
        this.registerFuneralModel.policyId = detail.policyId;
        this.registerFuneralModel.insuredLifeId = detail.insuredLifeId;

        this.claimCareService.GetClaimCloseReasons().subscribe(reasons => {
          this.claimReOpenReasons = reasons;
          this.isLoading = false;
        });

        this.appEventsManager.loadingStop();
      });
  }

  getPersonEventDetail(id: number): void {
    this.appEventsManager.loadingStart(`Getting details...`);
    this.isLoading = true;
    this.claimCareService.GetPersonEventByPersonEventId(id).subscribe(
      detail => {

        // Get the Rule results :
        this.registerFuneralModel.claimId = id;
        this.registerFuneralModel.policyId = detail.policyId;
        this.registerFuneralModel.insuredLifeId = detail.insuredLifeId;

        this.appEventsManager.loadingStart(`Getting rules...`);

        this.claimCareService.GetClaimCloseReasons().subscribe(reasons => {
          this.claimReOpenReasons = reasons;
          this.isLoading = false;
        });

        this.appEventsManager.loadingStop();
      });
  }

  setForm(item: any) {
    if (item == null) { return; }
    this.form.patchValue({
      // clmRef: item.claimReferenceNumber
    });
  }

  save() { }

  acceptCloseClaim() {
    const formModel = this.form.value;
    this.errorMessages = new Array();
    if (formModel.text == null || formModel.text === undefined || formModel.text === '') {
      this.errorMessages.push('Close note is required');
    }
    if (formModel.filter == null || formModel.filter === 0) {
      this.errorMessages.push('Close reason is mandatory');
    }

    if (this.errorMessages.length > 0) {
      this.messages = '';
      this.errorMessages.forEach(element => {
        this.messages = this.messages + element + ' ,';
      });
      this.messages = this.messages.slice(0, this.messages.length - 1);
      this.alertService.error(this.messages, 'Error', true);
      return false;
    }

    this.isProcessing = true;
    this.disabled = true;
    this.alertService.loading(`Processing...`, 'Processing', true);
    const note = this.readForm();
    this.notesService.addNote(ServiceTypeEnum.ClaimManager, note).subscribe(() => this.done('added', this.claimId));
  }

  done(action: string, claimId: any): void {
    if (action === 'added') {
      const PendingRequirementsStatus: WorkPoolUpdateStatus = {
        claimId,
        itemId: claimId,
        status: this.statusEnum.Closed,
        itemType: null
      };

      if(this.claimId != 'null'){
        this.claimCareService.updateWorkPoolStatus(PendingRequirementsStatus).subscribe(res => {
          this.router.navigateByUrl('claimcare/claim-manager/claim-workpool');
        });
      }
      else{
        const personEventUpdateStatus: PersonEventUpdateStatus = {
          claimId,
          itemId: this.personEventId,
          PersonEventStatus: this.personEventType.Closed,
          itemType: 'Close Claim'
        };
        this.claimCareService.updatePersonEventStatus(personEventUpdateStatus).subscribe(res => {
          this.router.navigateByUrl('claimcare/claim-manager/claim-workpool');
        });
      }


    }
    this.alertService.success(`The note has been ${action}.`);
  }

  returnToAssessor() {
  }

  back() {
    this.router.navigateByUrl('claimcare/claim-manager/claim-workpool');
  }

  stopLoading(): void {
    this.appEventsManager.loadingStop();
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { RegisterFuneralModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/register-funeral.model';
import { FuneralService } from '../../../Services/funeral.service';
import { FuneralRuleResult } from '../../../shared/entities/funeral/funeral-rule-result';
import { ClaimCancellationReasonsModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim-cancellation-reasons.model';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { StatusType } from 'projects/claimcare/src/app/claim-manager/shared/enums/status.enum';
import { WorkPoolUpdateStatus, WorkPoolModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { PersonEventType } from 'projects/claimcare/src/app/claim-manager/shared/enums/personEvent.enum';
import { PersonEventUpdateStatus } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { Item } from 'projects/fincare/src/app/shared/models/item';
import { Subscription, forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ClaimCancellationReasonEnum } from 'projects/shared-models-lib/src/lib/enums/claim-cancellation-reason.enum';

@Component({
  selector: 'app-cancel-claim',
  templateUrl: './cancel-claim.component.html',
  styleUrls: ['./cancel-claim.component.css']
})

export class CancelClaimComponent extends DetailsComponent implements OnInit, OnDestroy {
  selectedFilterTypeId = 0;
  claimCancelReasons: ClaimCancellationReasonsModel[];
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
  selectedCancelReason: string;
  claimCancellationReason: ClaimCancellationReasonEnum;
  statusEnum = StatusType;
  personEventType = PersonEventType;

  claimsDetailsRequests: Array<any>;
  updatePolicySubscription: Subscription;
  claimReasonsSubscription: Subscription;
  retrievalErrorMessage: string;

  constructor(
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly router: Router,
    dateAdapter: DateAdapter<NativeDateAdapter>,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimCareService: ClaimCareService,
    private readonly authService: AuthService,
    private readonly notesService: NotesService,
    private readonly funeralService: FuneralService) {
    super(appEventsManager, alertService, router, '', '', 1);
    dateAdapter.setLocale('en-za');
    this.ruleResultMessages = new Array();
  }

  public ngOnInit(): void {
    this.retrievalErrorMessage = 'An error occurred during the retrieval of claim reasons. Please try again.';
    this.claimsDetailsRequests = [];
   
    this.activatedRoute.params.subscribe((params: any) => {
      this.claimId = params.id;
      this.personEventId = params.personEventId;
      this.policyId = params.policyId;
      this.currentUser = this.authService.getCurrentUser();
      this.currentUserEmail = this.currentUser.email;
      this.isLoading = false;

      if (this.claimId != 'null') {
        this.getClaimDetail(this.claimId);
      }
      else {
        this.getPersonEventDetail(this.personEventId);
      }
      this.createForm(params.id);
    });
  }

  public ngOnDestroy(): void {
    if (this.updatePolicySubscription) {
      this.updatePolicySubscription.unsubscribe();
    }

    if (this.claimReasonsSubscription) {
      this.claimReasonsSubscription.unsubscribe();
    }
  }

  public createForm(id: any): void {
    this.clearDisplayName();
    this.form = this.formBuilder.group({
      id,
      beneficiaries: new UntypedFormControl(''),
      text: ['', [Validators.required, Validators.minLength(3)]],
      filter: new UntypedFormControl(''),
    });
  }

  public patchBankingForm(): void { }

  public selectedReasonChanged($event: any): void {
    const target = $event.source.selected._element.nativeElement;
    const selectedData = {
      value: $event.value,
      text: target.innerText.trim()
    };

    this.selectedCancelReason = selectedData.text;
    this.claimCancellationReason = selectedData.value;
  }

  public readForm(): Note {
   
    const formModel = this.form.value;
    this.selectedNote = new Note();
    this.selectedNote.reason = this.selectedCancelReason
    this.selectedNote.text = formModel.text.trim();
    this.selectedNote.itemId = this.claimId;
    this.selectedNote.itemType = 'Claim';

    if (this.claimId == 'null') {
      this.selectedNote.itemId = this.personEventId;
      this.selectedNote.itemType = 'PersonEvent';
    }

    this.selectedNote.modifiedBy = this.currentUserEmail;
    return this.selectedNote;
  }

  public setForm(item: any): void { }

  public save(): void { }

  public acceptCancelClaim(): boolean {
    const formModel = this.form.value;
    this.errorMessages = new Array();

    if (formModel.text == null
      || formModel.text === undefined ||
      formModel.text === '') {
      this.errorMessages.push('Cancel note is required');
    }

    if (formModel.filter == null || formModel.filter === 0) {
      this.errorMessages.push('Cancel reason is mandatory');
    }
      this.isLoading = true;

    if (this.errorMessages.length > 0) {
      this.messages = '';

      this.errorMessages.forEach(element => {
        this.messages = this.messages + element + ' ,';
      });

      this.messages = this.messages.slice(0, this.messages.length - 1);
      this.alertService.error(this.messages, 'Error', true);
      this.isLoading = false;
      return false;
      
    }

    this.alertService.loading(`Processing...`, 'Processing', true);
    const note = this.readForm();

    if (note.text.search('captured in error')) {
      const item = new Item();
      item.itemId = note.itemId;
      item.itemType = note.itemType;
      this.CancelClaim(item, note);
    }
  }

  public back(): void {
    this.router.navigateByUrl('claimcare/claim-manager/claim-workpool');
  }

  public stopLoading(): void {
    this.appEventsManager.loadingStop();
  }

  private CancelClaim(item: Item, note: Note) {
    this.isLoading = true;
   
    this.updatePolicySubscription = this.claimCareService
      .UpdatePolicyInsuredLife(item)
      .pipe(
        mergeMap(() => {
          if (this.claimId != 'null') {
            const PendingRequirementsStatus: WorkPoolUpdateStatus = {
              claimId: this.claimId,
              itemId: this.claimId,
              status: this.statusEnum.Cancelled,
              itemType: null,
              cancellationReason: this.claimCancellationReason
            };
            return this.claimCareService.updateWorkPoolStatus(PendingRequirementsStatus);
          }

          const personEventUpdateStatus: PersonEventUpdateStatus = {
            claimId: this.claimId,
            itemId: this.personEventId,
            PersonEventStatus: this.personEventType.Cancelled,
            itemType: 'Cancel Claim',
            cancellationReason: this.claimCancellationReason
          };

          return this.claimCareService.updatePersonEventStatus(personEventUpdateStatus);
        }),
        mergeMap(() => this.notesService.addNote(ServiceTypeEnum.ClaimManager, note)))
      .subscribe(() => {
        this.alertService.success('Claim was Cancelled Successfully');
        this.router.navigateByUrl('claimcare/claim-manager/claim-workpool');
        this.isLoading = false;
      }, (error) => {
        this.alertService.error('There was an error during the claim update, please try again');
        this.isLoading = false;
      });
  }

  private getClaimDetail(id: number): void {
    delete this.claimsDetailsRequests;
    this.claimsDetailsRequests = [];
    this.claimsDetailsRequests.push(this.claimCareService.GetFuneralRegistyDetailByClaimId(id))
    this.retrieveClaimsDetails(id);
  }

  private getPersonEventDetail(id: number): void {
    delete this.claimsDetailsRequests;
    this.claimsDetailsRequests = [];
    this.claimsDetailsRequests.push(this.claimCareService.GetPersonEventByPersonEventId(id))
    this.retrieveClaimsDetails(id);
  }

  private retrieveClaimsDetails(id: number): void {
    this.appEventsManager.loadingStart(`Getting details...`);
    this.isLoading = true;
    this.claimsDetailsRequests.push(this.claimCareService.GetClaimCancellationReasons())

    this.claimReasonsSubscription = forkJoin(this.claimsDetailsRequests)
      .subscribe(results => {
        let workPoolModel = results[0] as WorkPoolModel;
        this.registerFuneralModel.claimId = id;
        this.registerFuneralModel.policyId = workPoolModel.policyId;
        this.registerFuneralModel.insuredLifeId = workPoolModel.insuredLifeId;
        this.appEventsManager.loadingStart(`Getting rules...`);
        this.handleClaimReasons(results[1] as Array<ClaimCancellationReasonsModel>);
        this.appEventsManager.loadingStop();
      },
        (error) => {
          this.alertService.error(this.retrievalErrorMessage)
          this.isLoading = false;
        })
  }

  private handleClaimReasons(claimReasons: Array<ClaimCancellationReasonsModel>): void {
    if (!claimReasons || claimReasons.length == 0) {
      this.isLoading = false;
      return;
    }

    this.claimCancelReasons = claimReasons;
    const index = this.claimCancelReasons.findIndex(reason => reason.reasonId === 0);

    if (index > -1) {
      this.claimCancelReasons.splice(index, 1);
    }

    this.isLoading = false;
  }
}

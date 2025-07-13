import { Component, OnInit, ViewChild, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { WorkPoolModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { StatusType } from '../../../claim-manager/shared/enums/status.enum';
import { RecoveryListNotesComponent } from './recovery-list-notescomponent';

@Component({
  selector: 'recovery-notes',
  templateUrl: './recovery-notes.component.html'
})
export class RecoveryNotesComponent extends DetailsComponent implements OnInit, AfterViewInit {

  @ViewChild(RecoveryListNotesComponent, { static: true }) RecoveryListNotesNotesComponent: RecoveryListNotesComponent;

  @Input() hideButtons = false;

  itemType: string;
  claimId: number;
  itemTypeId: number;
  statusEnum = StatusType;
  workPoolModel: WorkPoolModel;

  constructor(
    alertService: AlertService,
    appEventsManager: AppEventsManager,
    dateAdapter: DateAdapter<NativeDateAdapter>,
    private readonly router: Router,
    private changeDedectorRef: ChangeDetectorRef,
    private readonly activatedRoute: ActivatedRoute,
    private readonly claimCareService: ClaimCareService) {

    super(appEventsManager, alertService, router, '', '', 1);
    dateAdapter.setLocale('en-za');
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.claimId) {
        const claimId = params.claimId;

        if (claimId !== null && claimId !== 'undefined' && claimId !== 'null') {
          this.itemType = 'Claim';
          this.itemTypeId = claimId;
        }
        this.getNotes(this.itemTypeId, ServiceTypeEnum.ClaimManager, this.itemType);
      }
    });
  }

  ngAfterViewInit(): void {
    this.changeDedectorRef.detectChanges();
  }

  /** @description Gets the notes for the selected details class */
  getNotes(id: number, serviceType: number, itemType: string): void {
    const noteRequest = new NotesRequest(serviceType, itemType, id);
    this.RecoveryListNotesNotesComponent.getData(noteRequest);
  }

  reOpenClaim() { }

  createForm() { }

  setForm() { }

  readForm() { }

  save() { }

  back() {
    this.router.navigateByUrl('claimcare/claim-manager/funeral/work-pool-list');
  }
}

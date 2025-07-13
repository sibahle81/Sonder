import { Component, OnInit, ViewChild, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { WorkpoolNotesComponent } from './workpool-notes.component';
import { WorkPoolModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { StatusType } from '../../shared/enums/status.enum';

@Component({
  selector: 'claim-notes',
  templateUrl: './claim-notes.component.html'
})
export class ClaimNotesComponent extends DetailsComponent implements OnInit, AfterViewInit {

  @ViewChild(WorkpoolNotesComponent, { static: true }) workpoolNotesComponent: WorkpoolNotesComponent;

  @Input() hideButtons = false;

  itemType: string;
  claimId: number;
  itemTypeId: number;
  personEventId: number;
  currentWorkpoolId: number;
  showClaimReOpen: boolean;
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
        const personEventId = params.personEventId;
        const currentWorkpoolId = params.workpoolId;

        if (personEventId !== null && personEventId !== 'undefined' && personEventId !== 'null') {
          this.itemType = 'PersonEvent';
          this.itemTypeId = personEventId;
        }
        if (claimId !== null && claimId !== 'undefined' && claimId !== 'null') {
          this.itemType = 'Claim';
          this.itemTypeId = claimId;
        }
        this.getNotes(this.itemTypeId, ServiceTypeEnum.ClaimManager, this.itemType);
      }
    });
  }

  ngAfterViewInit(): void {
    this.workpoolNotesComponent.hideButtons = this.hideButtons;
    this.changeDedectorRef.detectChanges();
  }

  /** @description Gets the notes for the selected details class */
  getNotes(id: number, serviceType: number, itemType: string): void {
    const noteRequest = new NotesRequest(serviceType, itemType, id);
    this.workpoolNotesComponent.getData(noteRequest);

    // get the claim to see if it is "Cancelled" to give the option to ReOpen
    this.claimCareService.getClaimById(id).subscribe(res => {
      this.workPoolModel = res;
      if (itemType === 'Claim') {
        if (this.workPoolModel.claimStatusId === StatusType.Cancelled) {
          this.showClaimReOpen = true;
        }
      }
    });
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

import { Component, OnInit,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Claim } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim.model';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { ClaimNote } from '../../shared/entities/claim-note';
import { PoolWorkFlow } from 'projects/shared-models-lib/src/lib/common/pool-work-flow';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { PoolWorkFlowService } from 'projects/shared-services-lib/src/lib/services/pool-work-flow/pool-work-flow.service';
import { PersonEventSearch } from '../../shared/entities/personEvent/person-event-search';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { PersonEventModel } from '../../shared/entities/personEvent/personEvent.model';
import { ReOpenReasonEnum } from './re-open-reason-enum';
import { PoolWorkFlowItemTypeEnum } from '../../shared/enums/pool-work-flow-item-type.enum';

@Component({
  selector: 're-open-reason-dialog',
  templateUrl: './re-open-reason-dialog.component.html',
  styleUrls: ['./re-open-reason-dialog.component.css'],
})
export class ReOpenReasonDialogComponent implements OnInit {

  claimNote: ClaimNote;
  reOpenComments: string;
  reOpenReason: string;
  claimReOpened: boolean;
  selectedPersonEvent: PersonEventModel;
  reOpenReasonTypes: ReOpenReasonEnum[];

  constructor(
    public dialogRef: MatDialogRef<ReOpenReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {personEvent: PersonEventSearch},
    private readonly claimCareService: ClaimCareService,
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    private readonly poolWorkService: PoolWorkFlowService,
    private readonly wizardService: WizardService,
  ) { }

  ngOnInit(): void {
    this.getLookups();
    this.claimNote = new ClaimNote();
    this.claimReOpened = false;
  }

  reOpenClaim() {
    if (!this.claimNote.reason) {
      this.alertService.error('Please provide reason for re-opening the claim');
      return;
    }

    let currentUser = this.authService.getUserEmail().toLowerCase();
    this.claimNote.claimId = this.data.personEvent.claimId;
    this.claimNote.createdBy = currentUser;

    if (this.isReasonPaymentRejectionOrReversal()) {
      const noteReason = this.formatLookup(this.claimNote.reason);
      this.alertService.loading('Sending workflow notification for '+ noteReason + '...');
      this.claimCareService.getPersonEvent(this.data.personEvent.personEventNumber).subscribe(result => {
        if (result) {
          this.selectedPersonEvent = result;
          this.sendPaymentReversalNotification();
        }
      });
      this.dialogRef.close(this.claimReOpened);
    }
    else {
      this.alertService.loading('Re opening claim...');

      let claim = new Claim();
      this.claimCareService.getClaimDetailsById(this.data.personEvent.claimId).subscribe((result) => 
      {
        if (result) {
          claim = result;
          claim.claimStatus = ClaimStatusEnum.Reopened;
          claim.claimStatusId = ClaimStatusEnum.Reopened;
          claim.claimNotes = [this.claimNote];
         
          this.claimCareService.updateClaim(claim).subscribe((result) => {
            if (result) {
              this.allocateClaimToWorkPool(claim);
              this.alertService.success('Claim has been re-opened');
              this.claimReOpened = true;
            }
            else {
              this.alertService.error('Claim re-open failed');
              this.claimReOpened = false;
            }
            this.dialogRef.close(this.claimReOpened);
          });
        }
        else {
         this.alertService.error('Failed to fetch claim details.');
        }
      });
    }
  }

  allocateClaimToWorkPool(claim: Claim) {
    const workPoolItem = this.createWorkPoolItem(claim);

    this.claimCareService.GetClaim(claim.claimId).subscribe(result => {
      if (result) {
        if (result.disabilityPercentage > 10) {
          workPoolItem.workPool = WorkPoolEnum.ScaPool;
        }
        else if (result.disabilityPercentage < 10) {
          workPoolItem.workPool = WorkPoolEnum.ClaimsAssessorPool;
        }
      }
      this.handlePoolWorkFlow(workPoolItem);
    });
  }

  createWorkPoolItem(claim: Claim): PoolWorkFlow {
    const workPoolItem = new PoolWorkFlow();
    workPoolItem.itemId = claim.personEventId;
    workPoolItem.workPool = WorkPoolEnum.CcaPool;
    workPoolItem.assignedByUserId = this.authService.getCurrentUser().id;
    workPoolItem.effectiveFrom = new Date();
    workPoolItem.poolWorkFlowItemType =  PoolWorkFlowItemTypeEnum.PersonEvent;
    return workPoolItem;
  }

  handlePoolWorkFlow(workPoolItem: PoolWorkFlow) {
    this.poolWorkService.handlePoolWorkFlow(workPoolItem).subscribe(result => {
      if (result) { }
    });
  }

  close(): void {
    this.claimReOpened = false;
    this.dialogRef.close(this.claimReOpened);
  }

  getLookups() {
    this.reOpenReasonTypes = this.ToArray(ReOpenReasonEnum);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  sendPaymentReversalNotification() {
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'claim-payment-reversal';
    startWizardRequest.data = JSON.stringify(this.selectedPersonEvent);
    startWizardRequest.linkedItemId = this.selectedPersonEvent.personEventId;
    this.wizardService.startWizard(startWizardRequest).subscribe(r => {
      this.alertService.success('Workflow notification created for payment reversal or rejection', 'Success', true);
    });
  }

  private isReasonPaymentRejectionOrReversal(): boolean {
    const { reason } = this.claimNote;
    return reason === ReOpenReasonEnum[ReOpenReasonEnum.PaymentRejection] 
      || reason === ReOpenReasonEnum[ReOpenReasonEnum.PaymentReversal];
  }
}

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { PoolWorkFlowService } from 'projects/shared-services-lib/src/lib/services/pool-work-flow/pool-work-flow.service';
import { PoolWorkFlowItemTypeEnum } from '../../enums/pool-work-flow-item-type.enum';
import { PoolWorkFlow } from 'projects/shared-models-lib/src/lib/common/pool-work-flow';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClaimItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { BehaviorSubject } from 'rxjs';
import { PoolWorkFlowRequest } from 'projects/shared-models-lib/src/lib/common/pool-work-flow-request';

@Component({
  selector: 'person-event-process-tracker',
  templateUrl: './person-event-process-tracker.component.html',
  styleUrls: ['./person-event-process-tracker.component.css']
})
export class PersonEventProcessTrackerComponent implements OnChanges {

  @Input() personEventId: number;
  @Input() triggerRefresh: boolean;
  @Input() isWizard = false;

  @Output() activeWizardsEmit: EventEmitter<Wizard[]> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  moduleName = 'claimcare';
  managerName = 'claim-manager';
  wizardTypeCSVs = 'capture-earnings,capture-earnings-override,capture-earnings-section-51,claim-investigation-coid,initiate-pension-case,claim-compliance';
  activeWizards: Wizard[];

  poolWorkFlows: PoolWorkFlow[];
  poolWorkFlow: PoolWorkFlow;

  constructor(
    private readonly poolWorkflowService: PoolWorkFlowService,
    public dialog: MatDialog
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.personEventId && this.personEventId > 0) {
      this.getPoolWorkFlow();
    }
  }

  getPoolWorkFlow() {
    this.isLoading$.next(true);

    const poolWorkFlowRequest = new PoolWorkFlowRequest();
    poolWorkFlowRequest.itemType = PoolWorkFlowItemTypeEnum.PersonEvent;
    poolWorkFlowRequest.itemId = this.personEventId;

    this.poolWorkflowService.getPoolWorkFlowByTypeAndId(poolWorkFlowRequest).subscribe(result => {
      if (result) {
        this.poolWorkFlow = result;
        this.poolWorkFlows = [this.poolWorkFlow];
      }

      this.isLoading$.next(false);
    });
  }

  setActiveWorkflows($event: Wizard[]) {
    this.activeWizards = $event;
    this.activeWizardsEmit.emit(this.activeWizards);
  }

  getWorkPoolName(workPool: WorkPoolEnum): string {
    return this.formatText(WorkPoolEnum[workPool]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  openAuditDialog() {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClaimManager,
        clientItemType: ClaimItemTypeEnum.PoolWorkFlow,
        itemId: this.poolWorkFlow.poolWorkFlowId,
        heading: 'Work Pool Movement Audit',
        propertiesToDisplay: ['WorkPool', 'AssignedToUserId', 'Instruction']
      }
    });
  }
}


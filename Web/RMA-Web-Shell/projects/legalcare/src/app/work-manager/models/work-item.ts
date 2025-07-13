import { WorkItemStateEnum } from 'projects/shared-models-lib/src/lib/enums/work-item-state.enum';
import { WorkItemType } from 'projects/legalcare/src/app/work-manager/models/work-item-type';

export class WorkItem {
  workItemId: number;
  workItemName: string;
  workItemType: WorkItemType;
  workItemState: WorkItemStateEnum;
  tenantId: number;
  additionalInformation: string;
}


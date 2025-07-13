import { Injectable } from '@angular/core';
import { PoolWorkFlow } from 'projects/shared-models-lib/src/lib/common/pool-work-flow';
import { PoolWorkFlowRequest } from 'projects/shared-models-lib/src/lib/common/pool-work-flow-request';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PoolWorkFlowService {
  private apiUrl = 'mdm/api/poolWorkFlow';

  constructor(
    private readonly commonService: CommonService) {
  }

  handlePoolWorkFlow(poolWorkFlow: PoolWorkFlow): Observable<number> {
    return this.commonService.postGeneric<PoolWorkFlow, number>(`${this.apiUrl}/HandlePoolWorkFlow`, poolWorkFlow);
  }

  getPoolWorkFlowItem(itemId: number, workPoolId: WorkPoolEnum): Observable<PoolWorkFlow> {
    return this.commonService.getAll<PoolWorkFlow>(`${this.apiUrl}/GetPoolWorkFlow/${itemId}/${workPoolId}`);
  }

  getPoolWorkFlowByTypeAndId(poolWorkFlowRequest: PoolWorkFlowRequest): Observable<PoolWorkFlow> {
    return this.commonService.postGeneric<PoolWorkFlowRequest, PoolWorkFlow>(`${this.apiUrl}/GetPoolWorkFlowByTypeAndId`, poolWorkFlowRequest);
  }
}


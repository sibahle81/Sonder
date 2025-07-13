import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ConstantApi } from 'src/app/shared/constants/constant';
import { RuleRequestResult } from '../../../rules-engine/shared/models/rule-request-result';
import { RejectWizardRequest } from '../models/reject-wizard-request';
import { SaveWizardRequest } from '../models/save-wizard-request';
import { StartWizardRequest } from '../models/start-wizard-request';
import { Wizard } from '../models/wizard';

@Injectable({
  providedIn: 'root'
})
export class WizardService {
  private apiUrl = 'bpm/api/Wizard';

  constructor(
    private readonly commonService: CommonService) {
  }

  getWizard(id: number): Observable<Wizard> {
    return this.commonService.get<Wizard>(id, this.apiUrl);
  }

  GetWizardByLinkedItemId(linkedItemId: number): Observable<Wizard> {
    return this.commonService.get<Wizard>(linkedItemId, `${this.apiUrl}/GetWizardByLinkedItemId`);
  }

  getWizardsByType(type: string): Observable<Wizard[]> {
    return this.commonService.getAll<Wizard[]>(`${this.apiUrl}/GetWizardsByType/${type}`);
  }

  getUserWizards(wizardConfigIds: string, canReassignTask: boolean): Observable<Wizard[]> {
    let apiUrl = `${this.apiUrl}/GetUserWizards`;

    if (wizardConfigIds != null && wizardConfigIds !== '') {
      const param = encodeURIComponent(wizardConfigIds);
      apiUrl = `${this.apiUrl}/GetUserWizardsByWizardConfigs/${param}/${canReassignTask}`;
    }

    return this.commonService.getAll<Wizard[]>(apiUrl);
  }

  GetWizardsByConfigIdsAndCreatedBy(wizardConfigIds: string, createdBy: string, claimId: number): Observable<Wizard[]> {
    let apiUrl;

    if (wizardConfigIds != null && wizardConfigIds !== '') {
      const param = encodeURIComponent(wizardConfigIds);
      apiUrl = `${this.apiUrl}/GetWizardsByConfigIdsAndCreatedBy/${param}/${createdBy}/${claimId}`;
    }
    return this.commonService.getAll<Wizard[]>(apiUrl);
  }

  GetPortalWizardsByConfigIdsAndCreatedBy(wizardConfigIds: string, createdBy: string): Observable<Wizard[]> {
    let apiUrl;

    if (wizardConfigIds != null && wizardConfigIds !== '') {
      const param = encodeURIComponent(wizardConfigIds);
      apiUrl = `${ConstantApi.wizardUrl}/GetPortalWizardsByConfigIdsAndCreatedBy/${param}/${createdBy}`;
    }
    return this.commonService.getAll<Wizard[]>(apiUrl);
  }

  searchWizards(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Wizard>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Wizard>>(`${this.apiUrl}/SearchWizards/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  startWizard(startWizardRequest: StartWizardRequest): Observable<Wizard> {
    return this.commonService.add<StartWizardRequest, Wizard>(startWizardRequest, `${this.apiUrl}/StartWizard`);
  }

  saveWizard(saveWizardRequest: SaveWizardRequest): Observable<boolean> {
    return this.commonService.edit(saveWizardRequest, `${this.apiUrl}/SaveWizard`);
  }

  continueWizard(wizardId: number): Observable<Wizard> {
    return this.commonService.getAll<Wizard>(`${this.apiUrl}/Continue/${wizardId}`);
  }

  submitWizard(wizardId: number): Observable<boolean> {
    return this.commonService.postWithNoData<boolean>(`${this.apiUrl}/SubmitWizard/${wizardId}`);
  }

  cancelWizard(wizardId: number): Observable<boolean> {
    return this.commonService.postWithNoData<boolean>(`${this.apiUrl}/CancelWizard/${wizardId}`);
  }

  requestApproval(wizardId: number): Observable<boolean> {
    return this.commonService.postWithNoData<boolean>(`${this.apiUrl}/RequestApproval/${wizardId}`);
  }

  approveWizard(wizardId: number): Observable<boolean> {
    return this.commonService.postWithNoData<boolean>(`${this.apiUrl}/ApproveWizard/${wizardId}`);
  }

  disputeWizard(rejectWizardRequest: RejectWizardRequest): Observable<Wizard> {
    return this.commonService.add<RejectWizardRequest, Wizard>(rejectWizardRequest, `${this.apiUrl}/DisputeWizard`);
  }

  rejectWizard(rejectWizardRequest: RejectWizardRequest): Observable<Wizard> {
    return this.commonService.add<RejectWizardRequest, Wizard>(rejectWizardRequest, `${this.apiUrl}/FinalRejectWizard`);
  }

  executeWizardRules(id: number): Observable<RuleRequestResult> {
    return this.commonService.postWithNoData<RuleRequestResult>(`${this.apiUrl}/ExecuteWizardRules/${id}`);
  }

  getLastViewedWizards(): Observable<Wizard[]> {
    return this.commonService.getAll<Wizard[]>(`${this.apiUrl}/LastViewed`);
  }

  updateWizardName(id: number, name: string): Observable<boolean> {
    return this.commonService.postWithNoData<boolean>(`${this.apiUrl}/RenameWizard/${id}/${name}`);
  }

  getWizardName(id: number): Observable<Wizard> {
    return this.commonService.getAll<Wizard>(`${this.apiUrl}/GetWizardName/${id}`);
  }

  getLastWizardByType(name: string): Observable<Wizard> {
    // const apiUrl = this.getApiUrl(`Wizard/GetLastWizardByType/${name}`);
    return this.commonService.getAll<Wizard>(`${this.apiUrl}/GetLastWizardByType/${name}`);
  }
  rejectOnCondition(rejectWizardRequest: RejectWizardRequest): Observable<Wizard> {
    return this.commonService.add<RejectWizardRequest, Wizard>(rejectWizardRequest, `${this.apiUrl}/RejectOnCondition`);
  }

  getWizardsByTypeAndLinkedItemId(linkedItemId: number, type: string): Observable<Wizard> {
    return this.commonService.getAll<Wizard>(`${this.apiUrl}/GetWizardsByTypeAndLinkedItemId/${linkedItemId}/${type}`);
  }

  getWizardsInProgresByTypeAndLinkedItemId(linkedItemId: number, type: string): Observable<Wizard[]> {
    return this.commonService.getAll<Wizard[]>(`${this.apiUrl}/GetWizardsInProgresByTypeAndLinkedItemId/${linkedItemId}/${type}`);
  }
}

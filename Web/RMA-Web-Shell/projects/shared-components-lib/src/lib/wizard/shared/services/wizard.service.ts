import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Wizard } from '../models/wizard';

import { StartWizardRequest } from '../models/start-wizard-request';
import { RejectWizardRequest } from '../models/reject-wizard-request';
import { SaveWizardRequest } from '../models/save-wizard-request';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { RuleRequestResult } from '../../../rules-engine/shared/models/rule-request-result';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { WizardApprovalStage } from '../models/wizard-approval-stage';
import { WizardPermission } from '../models/wizard-permission';
import { WizardPermissionTypeEnum } from '../models/wizard-permission-type-enum';

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

  getWizardByName(name: string): Observable<Wizard> {
    return this.commonService.getAll<Wizard>(`${this.apiUrl}/GetWizardByName/${name}`);
  }

  getUserWizards(wizardConfigIds: string, canReassignTask: boolean): Observable<Wizard[]> {
    let apiUrl = `${this.apiUrl}/GetUserWizards`;

    if (wizardConfigIds != null && wizardConfigIds !== '') {
      const param = encodeURIComponent(wizardConfigIds);
      apiUrl = `${this.apiUrl}/GetUserWizardsByWizardConfigs/${param}/${canReassignTask}`;
    }

    return this.commonService.getAll<Wizard[]>(apiUrl);
  }

  getUserWizardsByConfigs(wizardConfigIds: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, wizardStatus: string, lockStatus: string, orderOverride: string): Observable<PagedRequestResult<Wizard>> {
    let apiUrl = `${this.apiUrl}/GetUserWizards`;
    if (wizardConfigIds != null && wizardConfigIds !== '') {
    const param = encodeURIComponent(wizardConfigIds);
    const urlQuery = query != '' ? encodeURIComponent(query) : null;
    const orderOverrideParam = orderOverride != '' ? encodeURIComponent(orderOverride) : null;
    apiUrl = `${this.apiUrl}/GetUserWizardsByWizardConfigsPaged/${param}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${wizardStatus}/${lockStatus}/${orderOverrideParam}/${urlQuery}`;
    }

    return this.commonService.getAll<PagedRequestResult<Wizard>>(apiUrl);
  }

  getPagedUserWizardsByConfigsAndAssignedTo(wizardConfigIds: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Wizard>> {
    let apiUrl;

    if (wizardConfigIds != null && wizardConfigIds !== '') {
      const param = encodeURIComponent(wizardConfigIds);
      const urlQuery = encodeURIComponent(query);
      apiUrl = `${this.apiUrl}/GetPagedWizardsAssignedToMe/${param}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`;
    }
    return this.commonService.getAll<PagedRequestResult<Wizard>>(apiUrl);
  }

  GetWizardsByConfigIdsAndCreatedBy(wizardConfigIds: string, createdBy: string, claimId: number): Observable<Wizard[]> {
    let apiUrl;

    if (wizardConfigIds != null && wizardConfigIds !== '') {
      const param = encodeURIComponent(wizardConfigIds);
      apiUrl = `${this.apiUrl}/GetWizardsByConfigIdsAndCreatedBy/${param}/${createdBy}/${claimId}`;
    }
    return this.commonService.getAll<Wizard[]>(apiUrl);
  }

  searchWizards(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Wizard>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Wizard>>(`${this.apiUrl}/SearchWizards/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }
  searchUserNewWizardsByWizardType(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Wizard>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Wizard>>(`${this.apiUrl}/SearchUserNewWizardsByWizardType/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  SearchUserNewWizardsByWizardCapturedData(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Wizard>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Wizard>>(`${this.apiUrl}/SearchUserNewWizardsByWizardCapturedData/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  startWizard(startWizardRequest: StartWizardRequest): Observable<Wizard> {
    return this.commonService.postGeneric<StartWizardRequest, Wizard>(`${this.apiUrl}/StartWizard`, startWizardRequest);
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

  overrideWizard(wizardId: number): Observable<boolean> {
    return this.commonService.postWithNoData<boolean>(`${this.apiUrl}/OverrideWizard/${wizardId}`);
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
    return this.commonService.postGeneric<RejectWizardRequest, Wizard>(`${this.apiUrl}/DisputeWizard`,rejectWizardRequest);
  }

  rejectWizard(rejectWizardRequest: RejectWizardRequest): Observable<Wizard> {
    return this.commonService.postGeneric<RejectWizardRequest, Wizard>(`${this.apiUrl}/FinalRejectWizard`, rejectWizardRequest);
  }

  executeWizardRules(id: number): Observable<RuleRequestResult> {
    return this.commonService.postWithNoData<RuleRequestResult>(`${this.apiUrl}/ExecuteWizardRules/${id}`);
  }

  getLastViewedWizards(): Observable<Wizard[]> {
    return this.commonService.getAll<Wizard[]>(`${this.apiUrl}/LastViewed`);
  }

  updateWizardName(id: number, name: string): Observable<boolean> {
    const nameParam = encodeURIComponent(name.toString());
    return this.commonService.postWithNoData<boolean>(`${this.apiUrl}/RenameWizard/${id}/${nameParam}`);
  }

  getWizardName(id: number): Observable<Wizard> {
    return this.commonService.getAll<Wizard>(`${this.apiUrl}/GetWizardName/${id}`);
  }

  getLastWizardByType(name: string): Observable<Wizard> {
    // const apiUrl = this.getApiUrl(`Wizard/GetLastWizardByType/${name}`);
    return this.commonService.getAll<Wizard>(`${this.apiUrl}/GetLastWizardByType/${name}`);
  }
  rejectOnCondition(rejectWizardRequest: RejectWizardRequest): Observable<Wizard> {
    return this.commonService.postGeneric<RejectWizardRequest, Wizard>(`${this.apiUrl}/RejectOnCondition`, rejectWizardRequest);
  }

  getWizardsByTypeAndLinkedItemId(linkedItemId: number, type: string): Observable<Wizard> {
    return this.commonService.getAll<Wizard>(`${this.apiUrl}/GetWizardsByTypeAndLinkedItemId/${linkedItemId}/${type}`);
  }

  getWizardsInProgressByTypeAndLinkedItemId(linkedItemId: number, type: string): Observable<Wizard[]> {
    return this.commonService.getAll<Wizard[]>(`${this.apiUrl}/GetWizardsInProgressByTypeAndLinkedItemId/${linkedItemId}/${type}`);
  }

  getWizardsInProgressByTypesAndLinkedItemId(linkedItemId: number, wizardTypes: string): Observable<Wizard[]> {
    const param = encodeURIComponent(wizardTypes);
    return this.commonService.getAll<Wizard[]>(`${this.apiUrl}/GetWizardsInProgressByTypesAndLinkedItemId/${linkedItemId}/${param}`);
  }

  getWizardsByTypeAndId(id: number, type: string): Observable<Wizard> {
    return this.commonService.getAll<Wizard>(`${this.apiUrl}/GetWizardsByTypeAndId/${id}/${type}`);
  }
  
  updateWizardLockedToUser(id: number, lockedToUserId: number): Observable<boolean> {
    return this.commonService.postWithNoData<boolean>(`${this.apiUrl}/UpdateWizardLockedToUser/${id}/${lockedToUserId}`);
  }

  GetWizardApprovalStages(id: number): Observable<WizardApprovalStage[]> {
    return this.commonService.getAll<WizardApprovalStage[]>(`${this.apiUrl}/GetWizardApprovalStages/${id}`);
  }

  getWizardPermissionByWizardConfig(wizardConfigId: number, wizardPermission: WizardPermissionTypeEnum): Observable<WizardPermission> {
    return this.commonService.getAll<WizardPermission>(this.apiUrl + `/GetWizardPermissionByWizardConfig/${wizardConfigId}/${wizardPermission}`);
  }

  updateWizards(wizards: Wizard[]): Observable<boolean> {
    return this.commonService.postGeneric<Wizard[], boolean>(`${this.apiUrl}/UpdateWizards`, wizards);
  }
}

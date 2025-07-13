import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../core/services/common/common.service';
import { PagedRequestResult } from '../../core/models/pagination/PagedRequestResult.model';
import { RuleRequestResult } from '../components/rules-engine/shared/models/rule-request-result';
import { ConstantApi } from '../constants/constant';
import { RejectWizardRequest } from '../models/reject-wizard-request.model';
import { SaveWizardRequest } from '../models/save-wizard-request.model';
import { StartWizardRequest } from '../models/start-wizard-request.model';
import { Wizard } from '../models/wizard.model';

@Injectable({
  providedIn: 'root'
})
export class WizardService {

  constructor(
    private readonly commonService: CommonService) {
  }

  getWizard(id: number): Observable<Wizard> {
    return this.commonService.get<Wizard>(id, ConstantApi.WizardApiUrl);
  }

  GetWizardByLinkedItemId(linkedItemId: number): Observable<Wizard> {
    return this.commonService.get<Wizard>(linkedItemId, `${ConstantApi.WizardApiUrl}/GetWizardByLinkedItemId`);
  }

  getWizardsByType(type: string): Observable<Wizard[]> {
    return this.commonService.getAll<Wizard[]>(`${ConstantApi.WizardApiUrl}/GetWizardsByType/${type}`);
  }

  getUserWizards(wizardConfigIds: string, email: string, userRoleId: number): Observable<Wizard[]> {
    let apiUrl = `${ConstantApi.WizardApiUrl}/GetPortalUserWizards/${email}/${userRoleId}`;

    if (wizardConfigIds != null && wizardConfigIds !== '') {
      const param = encodeURIComponent(wizardConfigIds);
      apiUrl = `${ConstantApi.WizardApiUrl}/GetUserWizardsByWizardConfigsAndEmail/${param}/${email}/${userRoleId}`;
    }

    return this.commonService.getAll<Wizard[]>(apiUrl);
  }

  GetWizardsByConfigIdsAndCreatedBy(wizardConfigIds: string, createdBy: string, claimId: number): Observable<Wizard[]> {
    let apiUrl;

    if (wizardConfigIds != null && wizardConfigIds !== '') {
      const param = encodeURIComponent(wizardConfigIds);
      apiUrl = `${ConstantApi.WizardApiUrl}/GetWizardsByConfigIdsAndCreatedBy/${param}/${createdBy}/${claimId}`;
    }
    return this.commonService.getAll<Wizard[]>(apiUrl);
  }

  searchWizards(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Wizard>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Wizard>>(`${ConstantApi.WizardApiUrl}/SearchWizards/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  startWizard(startWizardRequest: StartWizardRequest): Observable<Wizard> {
    return this.commonService.add<StartWizardRequest, Wizard>(startWizardRequest, `${ConstantApi.wizardUrl}/StartWizard`);
  }

  /**
 * Able to reach IWizardHost => StartWizard(StartWizardRequest wizardRequest) backend method without any authentication ( to avoid HTTP 401 Unauthorized client error response status code when startWizard is called before authentication) needed and returns the Wizard data as result.
 * 
 * @param startWizardRequest - The StartWizardRequest data to be inserted.
 * @returns newly inserted Wizard data from startWizardRequest as result.
 */
  startWizardAnon(startWizardRequest: StartWizardRequest): Observable<Wizard> {
    return this.commonService.add<StartWizardRequest, Wizard>(startWizardRequest, `${ConstantApi.wizardUrl}/StartWizardAnon`);
  }

  saveWizard(saveWizardRequest: SaveWizardRequest): Observable<boolean> {
    return this.commonService.edit(saveWizardRequest, `${ConstantApi.WizardApiUrl}/SaveWizard`);
  }

  continueWizard(wizardId: number): Observable<Wizard> {
    return this.commonService.getAll<Wizard>(`${ConstantApi.WizardApiUrl}/Continue/${wizardId}`);
  }

  submitWizard(wizardId: number): Observable<boolean> {
    return this.commonService.postWithNoData<boolean>(`${ConstantApi.WizardApiUrl}/SubmitWizard/${wizardId}`);
  }

  cancelWizard(wizardId: number): Observable<boolean> {
    return this.commonService.postWithNoData<boolean>(`${ConstantApi.WizardApiUrl}/CancelWizard/${wizardId}`);
  }

  requestApproval(wizardId: number): Observable<boolean> {
    return this.commonService.postWithNoData<boolean>(`${ConstantApi.WizardApiUrl}/RequestApproval/${wizardId}`);
  }

  approveWizard(wizardId: number): Observable<boolean> {
    return this.commonService.postWithNoData<boolean>(`${ConstantApi.WizardApiUrl}/ApproveWizard/${wizardId}`);
  }

  disputeWizard(rejectWizardRequest: RejectWizardRequest): Observable<Wizard> {
    return this.commonService.add<RejectWizardRequest, Wizard>(rejectWizardRequest, `${ConstantApi.WizardApiUrl}/DisputeWizard`);
  }

  rejectWizard(rejectWizardRequest: RejectWizardRequest): Observable<Wizard> {
    return this.commonService.add<RejectWizardRequest, Wizard>(rejectWizardRequest, `${ConstantApi.WizardApiUrl}/FinalRejectWizard`);
  }

  executeWizardRules(id: number): Observable<RuleRequestResult> {
    return this.commonService.postWithNoData<RuleRequestResult>(`${ConstantApi.WizardApiUrl}/ExecuteWizardRules/${id}`);
  }

  getLastViewedWizards(): Observable<Wizard[]> {
    return this.commonService.getAll<Wizard[]>(`${ConstantApi.WizardApiUrl}/LastViewed`);
  }

  updateWizardName(id: number, name: string): Observable<boolean> {
    return this.commonService.postWithNoData<boolean>(`${ConstantApi.WizardApiUrl}/RenameWizard/${id}/${name}`);
  }

  getWizardName(id: number): Observable<Wizard> {
    return this.commonService.getAll<Wizard>(`${ConstantApi.WizardApiUrl}/GetWizardName/${id}`);
  }

  getLastWizardByType(name: string): Observable<Wizard> {
    // const apiUrl = this.getApiUrl(`Wizard/GetLastWizardByType/${name}`);
    return this.commonService.getAll<Wizard>(`${ConstantApi.WizardApiUrl}/GetLastWizardByType/${name}`);
  }
  rejectOnCondition(rejectWizardRequest: RejectWizardRequest): Observable<Wizard> {
    return this.commonService.add<RejectWizardRequest, Wizard>(rejectWizardRequest, `${ConstantApi.WizardApiUrl}/RejectOnCondition`);
  }

  getWizardsByTypeAndLinkedItemId(linkedItemId: number, type: string): Observable<Wizard> {
    return this.commonService.getAll<Wizard>(`${ConstantApi.WizardApiUrl}/GetWizardsByTypeAndLinkedItemId/${linkedItemId}/${type}`);
  }

  getWizardsInProgresByTypeAndLinkedItemId(linkedItemId: number, type: string): Observable<Wizard[]> {
    return this.commonService.getAll<Wizard[]>(`${ConstantApi.WizardApiUrl}/GetWizardsInProgresByTypeAndLinkedItemId/${linkedItemId}/${type}`);
  }
}

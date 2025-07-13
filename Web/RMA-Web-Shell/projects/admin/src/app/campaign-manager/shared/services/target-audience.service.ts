import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

import { TargetAudience } from '../entities/target-audience';
import { ImportRequest } from '../entities/import-request';
import { ImportResult } from '../entities/import-result';
import { TargetAudienceMember } from '../entities/target-audience-member';

@Injectable()
export class TargetAudienceService {

  private apiUrl = 'cmp/api/TargetAudience';

  private masterUrl = 'mdm/api';
  private clientUrl = 'clc/api/Client';

  constructor(
    private readonly commonService: CommonService) {
  }

  getTargetAudience(campaignId: number): Observable<TargetAudience[]> {
    return this.commonService.getAll(`${this.apiUrl}/Campaign/${campaignId}`);
  }

  importTargetAudience(importRequest: ImportRequest): Observable<ImportResult> {
    return this.commonService.postGeneric<ImportRequest, ImportResult>(`${this.apiUrl}/Members/Import`, importRequest);
  }

  saveTargetAudienceList(members: TargetAudience[]): Observable<number> {
    return this.commonService.postGeneric<TargetAudience[], number>(`${this.apiUrl}/Members/Save`, members);
  }

  saveTargetAudience(audience: TargetAudience): Observable<number> {
    return this.commonService.postGeneric<TargetAudience, number>(this.apiUrl, audience);
  }

  insertAudienceMember(member: TargetAudience): Observable<number> {
    return this.commonService.postGeneric<TargetAudience, number>(this.apiUrl, member);
  }

  updateAudienceMember(member: TargetAudience): Observable<boolean> {
    return this.commonService.edit<TargetAudience>(member, this.apiUrl);
  }

  getTargetCategoryItems(item: string): Observable<Lookup[]> {
    const apiUrl = this.getApiUrl(item.toLowerCase());
    return this.commonService.getAll<Lookup[]>(`${apiUrl}/${item}`);
  }

  getTargetCategoryItem(item: string, id: number): Observable<Lookup[]> {
    const apiUrl = this.getApiUrl(item.toLowerCase());
    return this.commonService.getAll<Lookup[]>(`${apiUrl}/${item}/${id}`);
  }

  removeAudienceMember(id: number): Observable<number> {
    return this.commonService.remove<number>(id, this.apiUrl);
  }

  getTargetClients(ids: number[]): Observable<TargetAudienceMember[]> {
    const apiUrl = `${this.clientUrl}/Contact/AudienceMembers/Clients`;
    return this.commonService.postGeneric<number[], TargetAudienceMember[]>(apiUrl, ids);
  }

  private getApiUrl(item: string): string {
    switch (item) {
      case 'clienttype': return this.masterUrl;
      case 'industry': return this.masterUrl;
      case 'industryclass': return this.masterUrl;
      // Add more as required
      default: return this.clientUrl;
    }
  }
}

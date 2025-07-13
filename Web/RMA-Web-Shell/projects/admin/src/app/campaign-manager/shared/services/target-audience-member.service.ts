import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { TargetAudienceMember } from '../entities/target-audience-member';

@Injectable()
export class TargetAudienceMemberService {

  private apiUrl = 'cmp/api/TargetAudienceMember';
  private clientContactUrl = 'clc/api/Client/Contact';
  private leadContactUrl = 'clc/api/Lead/LeadContact';

  constructor(
    private readonly commonService: CommonService) {
  }

  getTargetAudienceMembers(campaignId: number): Observable<TargetAudienceMember[]> {
    return this.commonService.getAll(`${this.apiUrl}/Campaign/${campaignId}`);
  }

  getTargetAudienceClientMembers(itemType: string, itemId: number): Observable<TargetAudienceMember[]> {
    return this.commonService.getAll(`${this.clientContactUrl}/AudienceMembers/${itemType}/${itemId}`);
  }

  getTargetAudienceLeadMembers(itemType: string, itemId: number): Observable<TargetAudienceMember[]> {
    return this.commonService.getAll(`${this.leadContactUrl}/AudienceMembers/${itemType}/${itemId}`);
  }

  saveTargetAudienceMemberList(members: TargetAudienceMember[]): Observable<number> {
    return this.commonService.postGeneric<TargetAudienceMember[], number>(this.apiUrl, members);
  }
}

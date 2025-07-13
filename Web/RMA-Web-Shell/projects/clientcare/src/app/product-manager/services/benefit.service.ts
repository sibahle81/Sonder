import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Benefit } from '../models/benefit';
import { LastViewedItem } from '../models/last-viewed-item';
import { RuleItem } from 'projects/shared-models-lib/src/lib/common/ruleItem';
import { BenefitsUploadSummary } from '../models/benefits-upload-summary';
import { BenefitUploadErrorAudit } from '../models/benefit-upload-error-audit';

@Injectable()
export class BenefitService {
  private apiBenefitUrl = 'clc/api/Product/Benefit';
  private apiBenefitRuleUrl = 'clc/api/Product/BenefitRule';

  constructor(
    private readonly commonService: CommonService,
    private readonly authService: AuthService) {
  }

  getNames(): Observable<string[]> {
    return this.commonService.getAll<string[]>(`${this.apiBenefitUrl}/UniqueName`);
  }

  getBenefit(id: any): Observable<Benefit> {
    return this.commonService.get<Benefit>(id, `${this.apiBenefitUrl}`);
  }

  getBenefits(): Observable<Benefit[]> {
    return this.commonService.getAll<Benefit[]>(this.apiBenefitUrl);
  }

  getBenefitsByBenefitIds(ids: number[]): Observable<Benefit[]> {
    const benefitIds = ids.map(id => `id=${id}`).join('&');
    const url = `${this.apiBenefitUrl}/GetBenefitsByBenefitIds?${benefitIds}`;
    return this.commonService.getAll<Benefit[]>(url);
  }

  getBenefitsForProductId(productId: number): Observable<Benefit[]> {
    const url = `${this.apiBenefitUrl}/Product/${productId}`;
    return this.commonService.getAll<Benefit[]>(url);
  }

  getBenefitRules(id: number): Observable<RuleItem[]> {
    return this.commonService.get<RuleItem[]>(id, this.apiBenefitRuleUrl);
  }

  editBenefitSkillCategories(benefitId: number, skillCaregoryIds: number[]): Observable<boolean> {
    const benefitSkillCategoryRequest: any = {};
    benefitSkillCategoryRequest.benefitId = benefitId;
    benefitSkillCategoryRequest.skillCategoryIds = skillCaregoryIds;
    return this.commonService.edit<Benefit>(benefitSkillCategoryRequest, `${this.apiBenefitUrl}/BenefitSkillCategory`);
  }

  addBenefitSkillCategories(benefitId: number, skillCategoryIds: number[]): Observable<number> {
    const benefitSkillCategory: any = {};
    benefitSkillCategory.benefitId = benefitId;
    benefitSkillCategory.skillCategoryIds = skillCategoryIds;
    return this.commonService.postGeneric<Benefit, number>(`${this.apiBenefitUrl}/BenefitSkillCategory`, benefitSkillCategory);
  }

  getLastViewedItems(): Observable<LastViewedItem[]> {
    return this.commonService.getAll<LastViewedItem[]>(`${this.apiBenefitUrl}/LastViewed`);
  }

  search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Benefit>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Benefit>>(`${this.apiBenefitUrl}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  addBenefitBatch(benefit: Benefit): Observable<number> {
    benefit.modifiedBy = this.authService.getUserEmail();
    return this.commonService.postGeneric<Benefit, number>(`${this.apiBenefitUrl}/BenefitBatch`, benefit);
  }

  editBenefitBatch(benefit: Benefit): Observable<boolean> {
    benefit.modifiedBy = this.authService.getUserEmail();
    return this.commonService.edit<Benefit>(benefit, `${this.apiBenefitUrl}/BenefitBatch`);
  }

  getBenefitTypes(): Observable<Lookup[]> {
    return this.commonService.getAll<Lookup[]>(`${this.apiBenefitUrl}/GetBenefitTypes`);
  }

  getDisabilityBenefitTypes(): Observable<Lookup[]> {
    return this.commonService.getAll<Lookup[]>(`${this.apiBenefitUrl}/GetDisabilityBenefitTerms`);
  }

  getCoverMemberTypes(): Observable<Lookup[]> {
    return this.commonService.getAll<Lookup[]>(`${this.apiBenefitUrl}/GetCoverMemberTypes`);
  }

  getEarningTypes(): Observable<Lookup[]> {
    return this.commonService.getAll<Lookup[]>(`${this.apiBenefitUrl}/GetEarningTypes`);
  }

  UploadBenefits(content: any): Observable<BenefitsUploadSummary> {
    return this.commonService.postGeneric<BenefitsUploadSummary, null>(`${this.apiBenefitUrl}/UploadBenefits`, content);
  }

  searchUploadBenefitsErrorAudit(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<BenefitUploadErrorAudit>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<BenefitUploadErrorAudit>>(`${this.apiBenefitUrl}/BenefitUploadErrorAudit/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

}

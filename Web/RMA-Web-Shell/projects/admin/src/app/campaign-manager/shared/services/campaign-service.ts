import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Campaign } from '../entities/campaign';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable()
export class CampaignService {

  private apiCampaign = 'cmp/api/Campaign';

  constructor(
    private readonly commonService: CommonService) {
  }

  searchCampaigns(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Campaign>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Campaign>>(`${this.apiCampaign}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
}

  ownerCampaigns(query: string): Observable<Campaign[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<Campaign[]>(`${this.apiCampaign}/Owner/${urlQuery}`);
  }

  getLastViewedCampaigns(): Observable<Campaign[]> {
    return this.commonService.getAll<Campaign[]>(`${this.apiCampaign}/LastViewed`);
  }

  getCampaigns(): Observable<Campaign[]> {
    return this.commonService.getAll<Campaign[]>(this.apiCampaign);
  }

  getCampaign(id: number): Observable<Campaign> {
    return this.commonService.get<Campaign>(id, `${this.apiCampaign}/ById`);
  }

  addCampaign(campaign: Campaign): Observable<number> {
    return this.commonService.postGeneric<Campaign, number>(this.apiCampaign, campaign);
  }

  sendReviewRequest(campaign: Campaign): Observable<boolean> {
    return this.commonService.edit<Campaign>(campaign, `${this.apiCampaign}/Review`);
  }

  createBillingCampaign(owner: string, clientIds: number[]): Observable<number> {
    const clients = clientIds.map(id => `clientId=${id}`).join('&');
    const url = `${this.apiCampaign}/CreateBilling?owner=${owner}&${clients}`;
    return this.commonService.postWithNoData(url);
  }

  editCampaign(campaign: Campaign): Observable<boolean> {
    return this.commonService.edit<Campaign>(campaign, this.apiCampaign);
  }

  copyCampaign(campaign: Campaign): Observable<number> {
    return this.commonService.postWithNoData(`${this.apiCampaign}/Copy/${campaign.id}`);
  }

  deleteCampaign(id: number): Observable<number> {
    return this.commonService.remove<number>(id, this.apiCampaign);
  }
}

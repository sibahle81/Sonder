import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { WorkItem } from './../../work-manager/models/work-item';
import { PagedRequestResult } from './../../../../../shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable({
  providedIn: 'root'
})
export class MarketingCareService {
  private apiUrl = 'marketing/api/marketing';

  newData:any;

  constructor(
    private readonly commonService: CommonService) {
  }

  addWorkItem(workItem: WorkItem): Observable<number> {
    return this.commonService.postGeneric<WorkItem, number>(this.apiUrl + "/AddWorkItem", workItem);
  }

  getWorkItem(id: number): Observable<WorkItem> {
    return this.commonService.get<WorkItem>(id, this.apiUrl + "/GetWorkItem");
  }

  getActiveWorkItems(type: number, name: string, createdBy: string): Observable<WorkItem[]> {
    if (!type)
      type = 0;
    if (this.isEmptyOrUndefined(name))
      name = "0";
    if (this.isEmptyOrUndefined(createdBy))
      createdBy = "0";
    return this.commonService.getAll<WorkItem[]>(this.apiUrl + `/GetWorkItems/${type}/${name}/${createdBy}`);
  }

  AddMarketingCareCmpgnGroup(data: any): Observable<any>{
    return this.commonService.postGeneric<any, any>(`mkt/api/MarketingCare/AddMarketingCareCampaignGroup`, data)
  }

    AddMarketingCareCmpgnSchedule(data: any): Observable<any>{
    return this.commonService.postGeneric<any, any>(`mkt/api/MarketingCare/AddMarketingCareCampaignSchedule`, data)
  }

  getCampaignsList(pageNumber: number, pageSize: number, createdBy: string, orderBy: string, search: string): Observable<any>{
    return this.commonService.getAll<any>(`mkt/api/MarketingCare/GetMarketingCareCampaign/all/${pageNumber}/${pageSize}/${createdBy}/${orderBy}/${search}`)
  }
  searchContactApprover(params: any): Observable<any>{
    let tempParam: string =params.search +'/' + params.page +'/' + params.pageSize;

    return this.commonService.getAll<any>(`mkt/api/MarketingCare/GetMarketingScheduleCampaignContacts/${tempParam}`)
   }
   searchGroupApprover(searchText:any): Observable<any>{
    return this.commonService.getAll<any>(`mkt/api/MarketingCare/GetMarketingCareGroupList/${searchText}`)
   }
  getAllCampaigns(params: any): Observable<any>{
    let tempParam: string = params.page +'/' + params.pageSize +'/' + params.orderBy +'/' + params.sortDirection +'/' + params.search;
    return this.commonService.getAll<any>(`mkt/api/MarketingCare/GetMarketingCareCampaignSchedule/${tempParam}`)
  }

  getFilteredWorkItems(type: number, createdBy: string): Observable<WorkItem[]> {
    if (!type)
      type = 0;
    if (this.isEmptyOrUndefined(createdBy))
      createdBy = "0";
    return this.commonService.getAll<WorkItem[]>(this.apiUrl + `/GetFilteredWorkItems/${type}/${createdBy}`);
  }

  getPagedWorkItemsByCreatedBy(createdBy: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string): Observable<PagedRequestResult<WorkItem>> {
    if (this.isEmptyOrUndefined(createdBy))
      createdBy = "0";
    return this.commonService.getAll<PagedRequestResult<WorkItem>>(`${this.apiUrl}/GetPagedWorkItemsByCreatedBy/${createdBy}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}`);
  }

  isEmptyOrUndefined(str): boolean {
    return (!str || 0 === str.length || undefined);
  }

  search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<WorkItem>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<WorkItem>>(`${this.apiUrl}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
}

  setGroupUpdateData(data){
    this.newData = data

}
 getGroupUpdateData(){
  return this.newData
}
}
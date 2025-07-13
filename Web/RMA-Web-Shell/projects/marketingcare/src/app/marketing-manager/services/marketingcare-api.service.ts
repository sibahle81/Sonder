import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MarketingcareApiService {

  constructor(private readonly commonService: CommonService) { }

  getCampaignList(key: string, params: any): Observable<any>{
    let tempParam: string = params.page +'/' + params.pageSize +'/' + params.orderBy +'/' + params.sortDirection +'/' + params.search;
    return this.commonService.getAll<any>(`mkt/api/MarketingCare/GetMarketingCareCampaign/${key}/${tempParam}`)
   }

  getMarketingCaregroupList(params: any): Observable<any>{
    let tempParam: string = params.page +'/' + params.pageSize +'/' + params.orderBy +'/' + params.sortDirection +'/' + params.search;
    return this.commonService.getAll(`mkt/api/MarketingCare/GetMarketingCareGroups/${tempParam}`) 
  }

  getMarketingCareGroupConditionEntity(){
    return this.commonService.getAll('mkt/api/MarketingCare/GetMarketingGroupConditionEntityDropDown')
  }

  getMarketingCareGroupConditionEntityDetails(value: string){
    return this.commonService.getAll(`mkt/api/MarketingCare/GetMarketingGroupConditionDropDown/${value}`)
  } 

  getCampaignTypeDetails(id: string): Observable<any>{
    return this.commonService.getAll(`mkt/api/MarketingCare/GetMarketingCareCampaignTypeName/${id}`) 
  }

  getMarketingCareApprovalList(id: string,campignId): Observable<any>{
    return this.commonService.getAll(`mkt/api/MarketingCare/GetMarketingCareCampaignTypeApproverList/${id}/${campignId}`) 
  }

  addMarketingCareCampaign(payload: any):Observable<any> {
    return this.commonService.postGeneric(`mkt/api/MarketingCare/AddMarketingCareCampaign`,payload) 
  }

  updateMarketingCareCampaignGroup(data: any):Observable<any>{
    return this.commonService.postGeneric('mkt/api/MarketingCare/UpdateMarketingCareCampaignGroup', data)
  }

  updateMarketingCareCampaignGroupConditions(data: any):Observable<any>{
    return this.commonService.postGeneric('mkt/api/MarketingCare/UpdateMarketingCareCampaignGroupCondition', data)
  }

  getGroupDataById(id: number){
    return this.commonService.getAll(`mkt/api/MarketingCare/GetMarketingCareCampaignGroupCondition/${id}`)
  }

  deleteMarketingCareGroup(id:string):Observable<any>{
    return this.commonService.postWithNoData(`mkt/api/MarketingCare/DeleteMarketingCareCampaignGroup/${id}`)
  }

  AddMarketingCareCampaignTemplate(payload: any):Observable<any> {
    return this.commonService.postGeneric(`mkt/api/MarketingCare/AddMarketingCareCampaignTemplate`,payload) 
  }
  getCampaignTypeList(params: any): Observable<any>{
    let tempParam: string = params.page +'/' + params.pageSize +'/' + params.orderBy +'/' + params.sortDirection +'/' + params.search;
    return this.commonService.getAll(`mkt/api/MarketingCare/GetMarketingCareCampaignType/${tempParam}`) 
  }

  getMarketingCareTypeRoleUsers(id: number, searchText: string): Observable<any>{
    return this.commonService.getAll(`mkt/api/MarketingCare/GetMarketingCareCampaignTypeRoleUser/${id}/${searchText}`) 
  }

  editcampaignType(id: number, updatedData: any): Observable<any> {
    return this.commonService.postGeneric<any, any>(`mkt/api/MarketingCare/UpdateMarketingCareCampaignType`, updatedData);
  }
  deleteAPIRecvPayment(Id: number): Observable<any>{
    return this.commonService.postNoData(`lmkt/api/MarketingCare/DeleteMarketingCareCampaignType/${Id}`)
  } 
 
 addCampaignType(data: any): Observable<any> {
  return this.commonService.postGeneric(`mkt/api/MarketingCare/AddMarketingCareCampaignType`, data);
}


updateCampaignType(id: number, data: any): Observable<any> {
  return this.commonService.postGeneric(`mkt/api/MarketingCare/UpdateMarketingCareCampaignType`, data);
}

getCampaignTypeApproverById(id: number,campignId:number): Observable<any> {

  return this.commonService.getAll(`mkt/api/MarketingCare/GetMarketingCareCampaignTypeApproverList/${id}/${campignId}`)
    .pipe(
      tap((response: any) => {
      }),
      catchError((error: any) => {
        return throwError(error);
      })
    );
}


deleteCampignType(id: number): Observable<any>{
  return this.commonService.postWithNoData(`mkt/api/MarketingCare/DeleteMarketingCareCampaignType/${id}`)
}
getDropdownValues(): Observable<any> {
  return this.commonService.getAll<any>(`mkt/api/MarketingCare/GetMarketingCareUserList/0`);
}

updateMarketingCareAprovers(data: any):Observable<any> {
  return this.commonService.postGeneric(`mkt/api/MarketingCare/UpdateMarketingCareCampaignApprovals`, data);
}

getCampaignTemplate(camapinId: number): Observable<any>{
  return this.commonService.getAll(`mkt/api/MarketingCare/GetMarketingCareCampaignTemplate/${camapinId}`) 
}

updateMarketingcareTemplate(data: any): Observable<any>{
  return this.commonService.postGeneric(`mkt/api/MarketingCare/UpdateMarketingCareCampaignTemplate`, data);
}

addMarketingCareApprover(data: any): Observable<any>{
  return this.commonService.postGeneric(`mkt/api/MarketingCare/AddMarketingCareCampaignApproval`, data);
}

addMarketingCareCampaignTemplate(data: any): Observable<any>{
  return this.commonService.postGeneric(`mkt/api/MarketingCare/AddMarketingCareCampaignTemplate`, data);
}

deleteCampaign(id: number): Observable<any>{
  return this.commonService.postWithNoData(`mkt/api/MarketingCare/DeleteMarketingCareCampaign/${id}`)
}

deleteCampignSchedule(id: number): Observable<any>{
  return this.commonService.postWithNoData(`mkt/api/MarketingCare/DeleteMarketingCareCampaignSchedule/${id}`)
}
updateMarketingCampaignStatus(data: any): Observable<any>{
  return this.commonService.postGeneric(`mkt/api/MarketingCare/UpdateMarketingCareCampaignStatus`, data)
}

getSelectedApprovers(id: number): Observable<any>{
  return this.commonService.getAll (`mkt/api/MarketingCare/GetMarketingCareCampaignApproval/${id}`)
}

getDeliveryReport(id: number): Observable<any>{
  return this.commonService.getAll (`mkt/api/MarketingCare/GetMarketingCareCampaignDeliveryReport/${id}`)
}

updateCampaign(data: any): Observable<any>{
  return this.commonService.postGeneric(`mkt/api/MarketingCare/UpdateMarketingCareCampaign`, data)
}

getTemplateDetails(id: number): Observable<any>{
  return this.commonService.getAll(`mkt/api/MarketingCare/GetMarketingCareCampaignTemplateChannel/${id}`)
}
marketingCareSendCampaignTask(): Observable<any>{
  return this.commonService.postWithNoData(`mkt/api/MarketingCare/MarketingCareSendCampaignTask`)
}

validateCampaignContacts(group: string,memberName: string): Observable<any> {
  return this.commonService.getAll<any>(`mkt/api/MarketingCare/ValidateMarketingCareCampaignScheduleContact/${group}/${memberName}`)
}

validateCampaignScheduleGroup(group: string,memberName: string): Observable<any> {
  return this.commonService.getAll<any>(`mkt/api/MarketingCare/ValidateMarketingCareCampaignScheduleGroup/${group}/${memberName}`)
}

}

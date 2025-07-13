import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { WorkItem } from './../../work-manager/models/work-item';
import { PagedRequestResult } from './../../../../../shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable({
  providedIn: 'root'
})
export class DebtCareService {
  private apiUrl = 'debt/api/debt';

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

addStatus(data: any): Observable<any>{
  return this.commonService.postGeneric<any, any>(`debt/api/Debtors/AddDebtCareStatusUpdate`, data)
}

updateStatus(data: any): Observable<any>{
  return this.commonService.postGeneric<any, any>(`debt/api/Debtors/UpdateDebtCareStatusUpdate`, data)
}

 getStatusList(query: string): Observable<any>{
  return this.commonService.getAll<any>(`debt/api/Debtors/GetDebtCareCollectionStatusList/${query}`)
 }

 getCollectionAgentList(): Observable<any>{
  return this.commonService.getAll<any>(`debt/api/Debtors/GetDebtCareCollectionAgentList`)
 }

 getDepartmentList(query: string): Observable<any>{
  return this.commonService.getAll<any>(`debt/api/Debtors/GetDebtCareUpdateStatusDepartment/${query}`)
 }

 getDepartmentEmployeeList(loggedUserEmail, departmentid): Observable<any>{
  return this.commonService.getAll<any>(`debt/api/Debtors/GetDebtCareUpdateStatusDepartmentUser/${loggedUserEmail}/${departmentid}`)
 }

 setTimeInDateRange(date: Date): Date {
  const toDate = new Date(date);
  toDate.setHours(23, 59, 59, 999);
  return toDate;
}

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient, private commonService: CommonService) { }
  getChartData(agentId: string, days: number): Observable<any> {
    return this.commonService.getAll(`debt/api/Debtors/GetDebtCareDashboardData/${agentId}/${days}`);
  }
  getChartGraphData(agentId: string, days: number): Observable<any> {
    return this.commonService.getAll(`debt/api/debtors/GetDebtCareDashboardChartData/${agentId}/${days}`);
  }

  getAssignAgentList(): Observable<any> {
    return this.commonService.getAll(`debt/api/Debtors/GetDebtCareReAssignAgentList`)
  }


}

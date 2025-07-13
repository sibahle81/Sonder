import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { CommonService } from "projects/shared-services-lib/src/lib/services/common/common.service";
import { InsuredLivesSummary } from "../entities/insured-lives-summary";
import { StageGroupRiskMember } from "../entities/stage-group-risk-member";
import { MemberVopdStatus } from "../entities/member-vopd-status";

@Injectable({
  providedIn: 'root'
})
export class GroupRiskService {

  private readonly api = 'clc/api/Policy/GroupRisk';

  constructor(private readonly commonService: CommonService) { }

  uploadGroupRisk(fileName: string, content: any,schemeRolePlayerPayeeId : number, productOptionCode: string): Observable<string[]> {
    const url = `${this.api}/UploadGroupRisk/${fileName}/${schemeRolePlayerPayeeId}/${productOptionCode}`;
    return this.commonService.postGeneric<string, string[]>(url, content);
  }

  verifyGroupRiskImport(fileIdentifier: string): Observable<InsuredLivesSummary> {
    const api = `${this.api}/VerifyGroupRiskImport/${fileIdentifier}`;
    return this.commonService.getAll<InsuredLivesSummary>(api);
  }

  getStageGroupRiskMembers(fileIdentifier: string): Observable<StageGroupRiskMember[]> {
    const url = `${this.api}/GetStagedGroupRiskMembers/${fileIdentifier}`;
    return this.commonService.getAll<StageGroupRiskMember[]>(url);
  }

  overrideRolePlayerVopd(dateOfDeath: Date, idNumber: string, firstName: string, surname: string, deceasedStatus: string, vopdDatetime: Date, fileIdentifier: string): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.api}/OverrideGroupRiskMemberVopd`, { dateOfDeath, idNumber, firstName, surname, deceasedStatus, vopdDatetime, fileIdentifier });
  }


  getGroupRiskVopdStatus(fileIdentifier: string): Observable<MemberVopdStatus[]> {
    const url = `${this.api}/GetGroupRiskVopdStatus/${fileIdentifier}`;
    return this.commonService.getAll<MemberVopdStatus[]>(url);
  }



  
}

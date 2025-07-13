import { Injectable } from "@angular/core";
import { Pagination } from "projects/shared-models-lib/src/lib/pagination/pagination";
import { CommonService } from "projects/shared-services-lib/src/lib/services/common/common.service";
import { LookupService } from "projects/shared-services-lib/src/lib/services/lookup/lookup.service";
import { Observable } from "rxjs";
import { Commutation } from "../models/commutation.model";
import { CommutationImpactAnalysis } from "../models/commutation-impact-analysis.model";

@Injectable({
  providedIn: 'root'
})
export class CommutationService {
  private apiUrl = 'pen/api/PensionCommutation';

  constructor(
    private readonly commonService: CommonService,
    private lookupService: LookupService) {
  }

  public getCommutations(query: string, pagination: Pagination): Observable<Commutation[]> {
    return this.commonService.getAll<Commutation[]>(`${this.apiUrl}/Commutation/${pagination.pageNumber}/${pagination.pageSize}/CreatedDate/${query}`);
  }

  public getAllCommutations(query: string, pagination: Pagination): Observable<Commutation[]> {
    return this.commonService.getAll<Commutation[]>(`${this.apiUrl}/GetAllCommutations/${pagination.pageNumber}/${pagination.pageSize}/CreatedDate/asc/${query}`);
  }

  public calculateImpactAnalysis(ledgerId: number): Observable<CommutationImpactAnalysis> {
    return this.commonService.getAll<CommutationImpactAnalysis>(`${this.apiUrl}/CalculateImpactAnalysis/${ledgerId}`);
  }

}

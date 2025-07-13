import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AgeAnalysisNote } from '../models/age-analysis-note';
import { AgeAnalysis } from '../models/age-analysis';
import { AgeAnalysisRequest } from '../models/age-analysis-request';

@Injectable()
export class AgeAnalysisService {

  private apiUrl = 'bill/api/AgeAnalysis';

  constructor(private readonly commonService: CommonService) { }

  getAgeAnalysis(ageAnalysisRequest: AgeAnalysisRequest): Observable<AgeAnalysis[]> {
    const url = `${this.apiUrl}/GetAgeAnalysis`;
    return this.commonService.postGeneric<AgeAnalysisRequest, AgeAnalysis[]>(url, ageAnalysisRequest);
  }

  getRecoveryAgeAnalysis(ageAnalysisRequest: AgeAnalysisRequest): Observable<AgeAnalysis[]> {
    const url = `${this.apiUrl}/GetRecoveryAgeAnalysis`;
    return this.commonService.postGeneric<AgeAnalysisRequest, AgeAnalysis[]>(url, ageAnalysisRequest);
  }

  assignCollectionAgent(assignments: any): Observable<number> {
    const url = `${this.apiUrl}/AssignCollectionAgent`;
    return this.commonService.postGeneric<any, number>(url, assignments);
  }

  importCollectionAgents(fileContent: any): Observable<number> {
    const url = `${this.apiUrl}/ImportCollectionAgents`;
    return this.commonService.postGeneric<any, number>(url, fileContent);
  }

  saveNote(note: AgeAnalysisNote): Observable<AgeAnalysisNote> {
    const url = `${this.apiUrl}/SaveNote`;
    return this.commonService.postGeneric<AgeAnalysisNote, AgeAnalysisNote>(url, note);
  }
}

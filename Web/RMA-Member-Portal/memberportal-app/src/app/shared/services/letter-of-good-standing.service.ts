import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/core/services/common/common.service';

@Injectable({
  providedIn: 'root'
})

export class LetterOfGoodStandingService {
  private apiUrl = 'clc/api/Member/LetterOfGoodStanding';
  datePipe = new DatePipe('en-US');

  constructor(
    private readonly commonService: CommonService) {
  }

  validateLetterOfGoodStanding(certificateNo: string): Observable<boolean> {
    return this.commonService.getAll<boolean>(`${this.apiUrl}/ValidateLetterOfGoodStanding/${certificateNo}`);
  }
}

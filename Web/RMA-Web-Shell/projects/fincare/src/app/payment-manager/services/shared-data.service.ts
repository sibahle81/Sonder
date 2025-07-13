import { Injectable } from '@angular/core';
import { CommissionPoolSearchParams } from '../models/commission-pool-search-params';
import { CommissionHeader } from '../models/commission-header';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
 public data:string[]=[];
 public lastReleaseStatus:number;
 public commissionReleaseStartDate: Date;
 public commissionReleaseEndDate: Date;
 public poolParams: CommissionPoolSearchParams;
 public commissionHeader: CommissionHeader;
  constructor() {
    this.data = []
    this.lastReleaseStatus = 0;
   }
}

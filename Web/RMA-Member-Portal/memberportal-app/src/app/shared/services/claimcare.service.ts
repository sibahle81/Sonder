import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CommonService } from "src/app/core/services/common/common.service";
import { ConstantApi } from "../constants/constant";
import { Claim } from "../models/claim.model";


@Injectable({
  providedIn: 'root'
})
export class ClaimCareService {

  constructor(
    private readonly commonService: CommonService) {
  }

  GetClaim(claimId: number): Observable<Claim> {
    return this.commonService.getAll<Claim>(`${ConstantApi.ClaimApiUrl}/GetClaim/${claimId}`);
  }
}

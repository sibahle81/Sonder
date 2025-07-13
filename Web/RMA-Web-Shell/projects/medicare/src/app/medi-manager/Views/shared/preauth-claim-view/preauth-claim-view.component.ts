import { isNullOrUndefined } from 'util';
import { Component, Input, OnInit } from '@angular/core';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthClaimDetail } from 'projects/medicare/src/app/preauth-manager/models/preauth-claim-detail';

@Component({
  selector: 'preauth-claim-view',
  templateUrl: './preauth-claim-view.component.html',
  styleUrls: ['./preauth-claim-view.component.css']
})
export class PreauthClaimViewComponent implements OnInit {
  @Input() personEventId: number;
  @Input() preAuthClaimDetail: PreAuthClaimDetail;

  constructor(
    private readonly mediCarePreAuthService: MediCarePreAuthService
    ) { }
  

  ngOnInit() {
    
  }

  getClaimDetails(){
    this.preAuthClaimDetail = new PreAuthClaimDetail();
    if(this.personEventId > 0 && !isNullOrUndefined(this.personEventId)){
    this.mediCarePreAuthService.getPreAuthClaimDetailByPersonEventId(this.personEventId).subscribe((res) => {
      if (res.claimId > 0) {
        this.preAuthClaimDetail = res;
      }      
    });
  }
  }

}

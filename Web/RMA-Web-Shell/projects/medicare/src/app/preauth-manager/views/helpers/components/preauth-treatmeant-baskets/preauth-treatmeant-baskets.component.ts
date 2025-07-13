import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';

import { Component, Input, OnInit } from '@angular/core';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'preauth-treatmeant-baskets',
  templateUrl: './preauth-treatmeant-baskets.component.html',
  styleUrls: ['./preauth-treatmeant-baskets.component.css']
})
export class PreAuthTreatingBasketsComponent implements OnInit {
  @Input() icd10Codes: Array<any>;
  basketDescriptions: Array<string> = [];

  constructor(
    private readonly mediCareService: MediCarePreAuthService,
  ){}

  ngOnInit(): void {
    if(!isNullOrUndefined(this.icd10Codes))
    {
      for (let i = 0; i < this.icd10Codes.length; i++) {

        let x = this.icd10Codes[i];
  
        this.mediCareService.getTreatmentBasketForICD10CodeId(x.icd10CodeId).subscribe(response => {
          if (!response) return;
          var treatmentBasketExists = this.basketDescriptions.some(t => t === response.description);
          if (!treatmentBasketExists) {
            this.basketDescriptions.push(response.description);
          }
        });
      };
    }
  }
}

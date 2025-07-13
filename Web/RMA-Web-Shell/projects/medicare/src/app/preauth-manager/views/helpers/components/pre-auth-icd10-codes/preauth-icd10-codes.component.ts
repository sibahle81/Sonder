import { Component, Input, OnInit } from '@angular/core';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';

@Component({
    selector: 'preauth-icd10-codes',
    templateUrl: './preauth-icd10-codes.component.html',
    styleUrls: ['./preauth-icd10-codes.component.css']
})
export class PreAuthICD10CodesComponent  implements OnInit {
  displayedColumns = ['icd10Code', 'description','bodySideId', 'injuryType', 'isClinicalUpdate', 'updateSequenceNo','isAuthorised'];
    @Input() bodySides: Array<any>;
    @Input() icd10Codes: Array<any>;
    @Input() type: string = 'normal';
    @Input() preAuthType: number;
    constructor(){}

    ngOnInit(): void { 
        this.getDisplayedColumns()
    }
    getBodySideDescription(bodySideId: number): string {
        if (!!bodySideId && !!this.bodySides) {
          let bodySide = this.bodySides.find(bs => { return bodySideId == bs.id; });
          
          if (bodySide) return bodySide.description;
        }
        return '';
      }
    
      getInjuryTypeDescription(injuryTypeId: number): string {
    
        if (!!injuryTypeId) {
          if (injuryTypeId === 1) {
            return "Primary";
          }
          else {
            return "Secondary";
          }
        }
        return '';
      }

  getDisplayedColumns(): string[] {
    let displayedColumns = [
      { def: 'icd10Code', show: true },
      { def: 'description', show: true },
      { def: 'bodySideId', show: true },
      { def: 'injuryType', show: true },
      { def: 'isClinicalUpdate', show: this.hideIfIsTreatmentAuthType() },//clinical
      { def: 'updateSequenceNo', show: this.hideIfIsTreatmentAuthType() },//clinical
      { def: 'isAuthorised', show: true },

    ];
    return displayedColumns.filter((cd) => cd.show).map((cd) => cd.def);
  }

  hideIfIsTreatmentAuthType(): boolean {
    let result = this.preAuthType == PreauthTypeEnum.Treatment ? false : true;
    return result;
  }

}

import { Component, OnInit, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { PersonEventExitReason } from '../../shared/entities/personEvent/personEventExitReason.model';
import { STPExitReasonEnum } from 'projects/shared-models-lib/src/lib/enums/stp-exit-reason.enum';
import { Constants } from '../../../constants';

@Component({
  selector: 'app-exit-reason-dialog',
  templateUrl: './exit-reason-dialog.component.html',
  styleUrls: ['./exit-reason-dialog.component.css']
})
export class ExitReasonDialogComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  personEventExitReason: PersonEventExitReason[];

  constructor(
    private readonly claimService: ClaimCareService,
    public dialog: MatDialogRef<ExitReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.getExitReasons();
    } else {
      this.isLoading$.next(false);
    }
  }

  getExitReasons() {
    this.claimService.getExitReasonsByEventNumber(this.data.itemId).subscribe(result =>{
      this.personEventExitReason = result;
      this.personEventExitReason.forEach( (item, index) => {
        if(item.stpExitReasonId == STPExitReasonEnum.Unknown) this.personEventExitReason.splice(index,1);
      });
      this.isLoading$.next(false);
    })
  }

  closeDialog(): void {
    this.dialog.close();
  }

  getSTPExitReason(id: number) {
    if(id > 0){
      let Heading = this.format(STPExitReasonEnum[id]);
      if (Heading === Constants.teamLeadLabel) {
        return Heading + Constants.teamLeadClaimManager
      } else {
        return Heading;
      }
    }else{
      return '';
    }
  }

  format(text: string) {
    if (text && text.length > 0) {
      const status = text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim();
      return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
    }
  }

}

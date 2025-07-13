
import { Component, Input, OnInit } from '@angular/core';
import { PreAuthMotivationForClaimReopening  } from 'projects/medicare/src/app/preauth-manager/models/preauth-motivation-for-claim-reopening';
import { Observable, of } from "rxjs";

@Component({
    selector: 'reopening-form-details',
    templateUrl: './reopening-form-details.component.html',
    styleUrls: ['./reopening-form-details.component.css'],
})
export class ReopeningFormDetailsComponent implements OnInit {

    @Input() reopeningFormDetails: PreAuthMotivationForClaimReopening[];
    reopenDetails$ : Observable<PreAuthMotivationForClaimReopening[]>;

    constructor(){}

    ngOnInit(): void {
        this.reopenDetails$ = of(this.reopeningFormDetails);
    }


}

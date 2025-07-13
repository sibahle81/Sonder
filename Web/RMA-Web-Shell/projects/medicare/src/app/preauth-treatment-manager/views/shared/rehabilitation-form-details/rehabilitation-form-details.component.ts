
import { Component, Input, OnInit } from '@angular/core';
import { PreAuthRehabilitation  } from 'projects/medicare/src/app/preauth-manager/models/rehabilitation';
import { Observable, of } from "rxjs";

@Component({
    selector: 'rehabilitation-form-details',
    templateUrl: './rehabilitation-form-details.component.html',
    styleUrls: ['./rehabilitation-form-details.component.css'],
})
export class RehabilitationFormDetailsComponent implements OnInit {

    @Input() rehabiliations: PreAuthRehabilitation[];
    rehabDetails$ : Observable<PreAuthRehabilitation[]>;

    constructor(){}

    ngOnInit(): void {
        this.rehabDetails$ = of(this.rehabiliations);
    }

}

import { PreAuthLevelOfCare } from 'projects/medicare/src/app/preauth-manager/models/preauth-levelofcare';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'level-of-care',
    templateUrl: './level-of-care.component.html',
    styleUrls: ['./level-of-care.component.css']
})
export class LevelOfCareComponent  implements OnInit {
    displayedColumns = ['tariffCode', 'levelOfCare', 'dateTimeAdmitted', 'dateTimeDischarged', 'lengthOfStay'];
    @Input() levelOfCare: Array<PreAuthLevelOfCare>;
    dataSource: Array<PreAuthLevelOfCare>;

    constructor(){}
    ngOnInit(): void {  
        
    }
}

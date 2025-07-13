import { Component, Input, OnInit } from '@angular/core';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ClaimAuthorisationsTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-authorisations-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'claim-authorisations-container',
  templateUrl: './claim-authorisations-container.component.html',
  styleUrls: ['./claim-authorisations-container.component.css']
})
export class ClaimAuthorisationsContainerComponent implements OnInit {

  @Input() personEvent: PersonEventModel;

  currentUserLoggedIn: User;
  query: ClaimAuthorisationsTypeEnum;
  claimDisability = [];

  constructor(
    private readonly authService: AuthService) { }

  ngOnInit(): void {
    this.currentUserLoggedIn = this.authService.getCurrentUser();
  }

  authorisationTypeChange($event: ClaimAuthorisationsTypeEnum) {
    this.personEvent = {...this.personEvent};
    this.query = $event;
  }
}

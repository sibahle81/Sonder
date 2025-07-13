import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ClaimRequirementService } from '../../Services/claim-requirement.service';
import { PersonEventClaimRequirement } from '../../shared/entities/person-event-claim-requirement';

@Component({
  selector: 'claim-requirements-view',
  templateUrl: './claim-requirements-view.component.html',
  styleUrls: ['./claim-requirements-view.component.css']
})
export class ClaimRequirementsViewComponent implements OnInit {
  @Input() personEventId: number;
  public personEventClaimRequirements: PersonEventClaimRequirement[] = [];
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly claimRequirementService: ClaimRequirementService,
  ) { }

  ngOnInit(): void {
    this.isLoading$.next(true);
    this.claimRequirementService.GetPersonEventRequirements(this.personEventId).subscribe(results => {
      if(results.length > 0){
        this.personEventClaimRequirements = results;
      }
      this.isLoading$.next(false);
    }, (error) => {
      this.isLoading$.next(false);
    })
  }

}

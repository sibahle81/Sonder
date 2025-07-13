import { AfterViewChecked, ChangeDetectorRef, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';

@Component({
  templateUrl: './medicare-claimsearch.component.html',
  styleUrls: ['./medicare-claimsearch.component.css']
})
export class MedicareClaimSearchComponent implements AfterViewChecked {

  @ViewChild('componentContainer', { read: ViewContainerRef }) componentContainer: ViewContainerRef;
  selectedPersonEvent: PersonEventModel;
  
  constructor(private readonly changeDetectorRef: ChangeDetectorRef, private readonly router: Router) { 
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  setPersonEvent($personEvent: PersonEventModel): void {
    this.selectedPersonEvent = $personEvent;
    this.router.navigate(['/medicare/view-search-results', this.selectedPersonEvent.personEventId]);
  }
}

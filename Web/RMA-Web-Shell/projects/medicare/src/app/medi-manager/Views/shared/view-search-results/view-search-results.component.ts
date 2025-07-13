import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common'
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { PreauthTypeEnum } from '../../../enums/preauth-type-enum';

@Component({
  selector: 'view-search-results',
  templateUrl: './view-search-results.component.html',
  styleUrls: ['./view-search-results.component.css']
})

export class ViewSearchResultsComponent implements OnInit, OnChanges {
  loadingData$ = new BehaviorSubject<boolean>(false);
  isInternalUser: boolean = false;
  currentUserEmail: string;
  selectedTab = 0;
  noPersonEventLink: boolean = false;
  @Input() personEventId: number;
  @Input() claimId: number;
  selectedEvent: EventModel;
  @Input() selectedPersonEvent: PersonEventModel;
  icd10List = [];
  mode = ModeEnum.Default;
  @Input() eventId: Number;
  previousUrl = '';
  @Input() preloadMedicalInvoices = false;
  @Input() searchedPreauthType: PreauthTypeEnum = PreauthTypeEnum.Unknown;
  @Input() selectedPreAuthId = 0;
  @Input() isHolisticView = false;
  @Input() isWizard = false;

  constructor(
    private readonly authService: AuthService,
    private readonly claimCareService: ClaimCareService,
    private activeRoute: ActivatedRoute,
    public datepipe: DatePipe,
    private router: Router) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.personEventId > 0) {
      this.loadingData$.next(true);
      this.getPersonEvent();
    }
  }


  ngOnInit(): void {
    var currentUser = this.authService.getCurrentUser();
    this.currentUserEmail = currentUser.email;
    this.isInternalUser = currentUser.isInternalUser;
    if (this.isWizard)
      return;
    this.activeRoute.params.subscribe(params => {
      this.personEventId = params['id'];
      if (this.personEventId > 0) {
        this.loadingData$.next(true);
        this.getPersonEvent();
      }
      else {
        this.noPersonEventLink = true;
      }

      if (params['searchedPreauthType'] && params['searchedPreauthType'] != 'holisticview') {
        this.searchedPreauthType = params['searchedPreauthType'];
      }

      if (params['selectedPreAuthId']) {
        if (params['searchedPreauthType'] == 'holisticview') {
          this.isHolisticView = true;
          this.claimId = parseInt(params['selectedPreAuthId']);
        }
        else {
          this.selectedPreAuthId = parseInt(params['selectedPreAuthId']);
        }
      }
    });
  }

  getPersonEvent() {
    this.claimCareService.getPersonEvent(this.personEventId).subscribe(result => {
      this.selectedPersonEvent = result;
      this.eventId = this.selectedPersonEvent.eventId
      this.getEvent();
    })
  }

  getEvent() {
    this.claimCareService.getEventDetails(this.selectedPersonEvent.eventId).subscribe(result => {
      this.selectedEvent = result;
      this.loadingData$.next(false);
      if (this.previousUrl) {
        this.preloadMedicalInvoices = this.previousUrl.includes('search-medical-invoices');
      }
    })
  }

  setPersonEvent(personEvent: PersonEventModel) {
    this.selectedPersonEvent = personEvent;
  }

  back(): void {
    if (this.preloadMedicalInvoices) {
      this.router.navigate(['medicare/search-medical-invoices']);
    } else if (this.selectedPersonEvent && this.selectedPersonEvent.claims &&
      this.selectedPersonEvent.claims.length > 0 && this.searchedPreauthType &&
      this.searchedPreauthType != PreauthTypeEnum.Unknown) {
      this.router.navigate(['medicare/search-preauthorisation']);
    } else if (this.isHolisticView) {
      this.router.navigate(['medicare/medi-home']);
    } else {
      this.router.navigate([this.previousUrl]);
    }
  }
}

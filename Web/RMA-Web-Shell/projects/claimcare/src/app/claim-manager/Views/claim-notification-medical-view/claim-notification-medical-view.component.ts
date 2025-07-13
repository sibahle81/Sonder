import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ClaimCareService } from '../../Services/claimcare.service';
import { EventModel } from '../../shared/entities/personEvent/event.model';
import { EventTypeEnum } from '../../shared/enums/event-type-enum';

@Component({
  selector: 'claim-notification-medical-view',
  templateUrl: './claim-notification-medical-view.component.html',
  styleUrls: ['./claim-notification-medical-view.component.css']
})
export class ClaimNotificationMedicalViewComponent implements OnInit,OnDestroy {
  public event = new EventModel();
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public showAccidentDetails = false;

  private personDetailsSubscription: Subscription;

  constructor(
    private readonly claimService: ClaimCareService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly alertService: AlertService
    ) { }

  public ngOnInit(): void {
    this.isLoading$.next(true);
    this.activatedRoute.params.subscribe(params => {
      this.personDetailsSubscription = this.claimService.getPersonEventDetails(params.personEventId)
      .subscribe(result => {
                  this.event = result;
                  this.showAccidentDetails = result.eventType === EventTypeEnum.Accident;
                  this.isLoading$.next(false);
      },
      (error) => {
        this.alertService.error(error);
        this.isLoading$.next(false);
      });
    });
  }

  public ngOnDestroy(): void {
    if (this.personDetailsSubscription) {
      this.personDetailsSubscription.unsubscribe();
    }
  }

  public back(): void {
    this.router.navigateByUrl('/claimcare/claim-manager/person-event-search');
  }
}

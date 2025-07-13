import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AnnualIncreaseNotification} from '../../models/annual-increase-notification.model';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertService} from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import {GazetteService} from '../../../../../../shared-services-lib/src/lib/services/gazette/gazette.service';
import {AppEventsManager} from '../../../../../../shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import {AuthService} from '../../../../../../shared-services-lib/src/lib/services/security/auth/auth.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ConfirmationDialogsService} from '../../../../../../shared-components-lib/src/lib/confirm-message/confirm-message.service';
import {DatePipe} from '@angular/common';
import {Validators} from 'ngx-editor';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {BehaviorSubject} from 'rxjs';
import {AnnualIncreaseService} from '../../services/annual-increase.service';
import {PensionGazetteTypeEnum} from '../../../../../../shared-models-lib/src/lib/enums/gazette/pension/pension-gazette-type-enum';
import {IncreaseTypeEnum} from '../../lib/enums/increase-type-enum';
import {PensionGazetteValueTypeEnum} from '../../../../../../shared-models-lib/src/lib/enums/gazette/pension/pension-gazette-value-type-enum';
import {LegislativeValueEnum} from '../../lib/enums/legislative-value-enum';
import {StartWizardRequest} from '../../../../../../shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import {WizardService} from '../../../../../../shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import {IncreaseAmountType} from '../../lib/enums/amount-type-enum';


@Component({
  selector: 'app-initiate-gazette-pension-increase',
  templateUrl: './initiate-Gazette-Pension-Increase.component.html',
  styleUrls: ['./initiate-Gazette-Pension-Increase.component.css'],
})
export class InitiateGazettePensionIncreaseComponent implements OnInit {

  constructor(
    private readonly appEventsManager: AppEventsManager,
    private readonly activatedRoute: ActivatedRoute,
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly datePipe: DatePipe,
    private readonly confirmService: ConfirmationDialogsService,
    private readonly gazetteService: GazetteService,
    private  readonly annualIncreaseService: AnnualIncreaseService,
    private readonly wizardService: WizardService,
    private readonly router: Router) {}
  private creatingWizard: boolean;


  form: FormGroup;
  selectedEffectiveDate: Date;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild("filter", { static: false }) filter: ElementRef;
  displayedColumns = [
    "increaseType",
    "percentage",
    "amount",
    "fromAccidentDate",
    "toAccidentDate",
    "effectiveDate",
    "actions",
  ];
  public dataSource = new MatTableDataSource<AnnualIncreaseNotification>();
  annualIncreaseNotifications: AnnualIncreaseNotification[]  = [] ;
  isLoadingPensionGazette$: BehaviorSubject<boolean> = new BehaviorSubject(
    false,
  );
  isCreatingPensionGazetteWizard$: BehaviorSubject<boolean> = new BehaviorSubject(
    false,
  );

  protected readonly IncreaseTypeEnum = IncreaseTypeEnum;

   ngOnInit(): void {
    this.createForm();

   }

  newEffectiveDateChanged($event: any) {
    this.selectedEffectiveDate = new Date($event.value);
  }

  createForm(): void {
    this.form = this.fb.group({
      effectiveDate: ['', Validators.required],
    });
  }

  searchPensionIncreaseGazette(): void {
    this.annualIncreaseNotifications = [];
    this.isLoadingPensionGazette$.next(true);
    if (this.selectedEffectiveDate){
       this.gazetteService.getPensionGazettesAsOfEffectiveDate(  this.datePipe.transform(this.selectedEffectiveDate, 'yyyy-MM-dd')).subscribe(pensionGazetteResults => {
         if (pensionGazetteResults.length > 0) {
           pensionGazetteResults.forEach(pensionGazetteResult => {
             const annualIncreaseNotification = new AnnualIncreaseNotification();
             annualIncreaseNotification.increaseType = pensionGazetteResult.pensionGazetteType === PensionGazetteTypeEnum.AnnualIncrease ? IncreaseTypeEnum.Statutory : IncreaseTypeEnum.StatutoryCAA;
             annualIncreaseNotification.effectiveDate = pensionGazetteResult.effectiveFrom;
             annualIncreaseNotification.legislativeValue = LegislativeValueEnum.Statutory;
             annualIncreaseNotification.gazetteId = pensionGazetteResult.pensionGazetteId;
             if (pensionGazetteResult.increases.length > 0) {
               pensionGazetteResult.increases.forEach(increaseResult => {

                 if (increaseResult.valueType === PensionGazetteValueTypeEnum.MonetaryValue) {
                   annualIncreaseNotification.amount = increaseResult.value;
                   annualIncreaseNotification.percentage = 0;
                   annualIncreaseNotification.pensionIncreaseAmountType =  IncreaseAmountType.Amount;
                 }

                 if (increaseResult.valueType === PensionGazetteValueTypeEnum.Percentage) {
                   annualIncreaseNotification.percentage = increaseResult.value;
                   annualIncreaseNotification.amount = 0;
                   annualIncreaseNotification.pensionIncreaseAmountType =  IncreaseAmountType.Percentage;
                 }

                 annualIncreaseNotification.fromAccidentDate =  increaseResult?.incidentMinDate;
                 annualIncreaseNotification.toAccidentDate =  increaseResult?.incidentMaxDate;
               });
             }
             this.annualIncreaseNotifications.push(annualIncreaseNotification);

           });
         }
         else{
           this.alertService.error(
             'No gazetted pension increases could be found for selected effective date.',
           );
         }

       });
     }else{
       this.alertService.error(
         'Please select effective date.',
       );
     }
    this.isLoadingPensionGazette$.next(false);
    this.BindDataSource();
  }

  initiatePensionIncreaseCaseWizard(row: AnnualIncreaseNotification) {

    this.confirmService
      .confirmWithoutContainer(
        'Pension Increase',
        'Are you sure you want to create a pension increase workflow?',
        'Center',
        'Center',
        'Yes',
        'No',
      )
      .subscribe((result) => {
        if (result === true) {
          this.annualIncreaseService.getAnnualIncreaseNotificationByTypeAndEffectiveDate( row.increaseType , this.datePipe.transform(this.selectedEffectiveDate, 'yyyy-MM-dd')).subscribe(annualIncreaseNotifications => {
            const filteredAnnualIncreaseNotifications = annualIncreaseNotifications.filter(x => x.percentage === row.percentage &&  x.amount === row.amount && x.gazetteId === row.gazetteId );
            if (filteredAnnualIncreaseNotifications.length > 0){
              this.alertService.error(
                'Cannot create gazetted pension increase as it already exists.',
              );
            }else{
              this.startWizard(row);
            }
          });
        }
      });

  }

  startWizard(data: AnnualIncreaseNotification) {

    this.isCreatingPensionGazetteWizard$.next(true);
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.data = JSON.stringify(data);
    startWizardRequest.type = 'pensions-annual-increase';
    this.creatingWizard = true;
    this.wizardService.startWizard(startWizardRequest).subscribe((result) => {
      this.creatingWizard = false;
      this.isCreatingPensionGazetteWizard$.next(false);
      this.alertService.success('Annual Increase wizard started successfully');
      this.router.navigateByUrl(`/penscare/pensions-annual-increase/continue/${result.id}`);
    });
  }

  formatLookup(lookup: string): string {
    return lookup
      ? lookup.replace(/([a-z])([A-Z])/g, '$1 $2').replace('_', '-')
      : 'N/A';
  }

  BindDataSource(): void {
    this.dataSource.data = this.annualIncreaseNotifications;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}

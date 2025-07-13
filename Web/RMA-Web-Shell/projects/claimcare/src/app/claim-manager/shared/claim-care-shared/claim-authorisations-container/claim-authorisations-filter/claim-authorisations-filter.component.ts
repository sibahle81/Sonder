import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { MatDialog } from '@angular/material/dialog';
import { ClaimAuthorisationsTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-authorisations-type-enum';
import { ClaimAuthorisationsDialogComponent } from '../claim-authorisations-dialog/claim-authorisations-dialog.component';
import { TravelAuthorisation } from '../claim-travel-authorisations/claimTravelAuthorisations';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'claim-authorisations-filter',
  templateUrl: './claim-authorisations-filter.component.html',
  styleUrls: ['./claim-authorisations-filter.component.css']
})
export class ClaimAuthorisationsFilterComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;

  @Output() authorisationsTypeEmit: EventEmitter<ClaimAuthorisationsTypeEnum> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  viewPermission = 'View Claim Authorisation Filter'
  editPermission = 'Edit Claim Authorisation Filter'

  user: User;
  form: any;
  AuthorisationsTypes: ClaimAuthorisationsTypeEnum[];
  searchTerm = '';
  query: ClaimAuthorisationsTypeEnum;

  constructor(
    private readonly formBuilder: FormBuilder,
    public dialog: MatDialog,
    private readonly authService: AuthService,
  ) {
    super();
    this.user = this.authService.getCurrentUser();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.user) { return; }
    this.createForm();
    this.configureSearch();
    this.isLoading$.next(false);
  }

  getLookups() {
    this.AuthorisationsTypes = this.ToArray(ClaimAuthorisationsTypeEnum);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  configureSearch() {
    this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
      this.search(response as string);
    });
  }

  search(searchTerm: string) {
    this.searchTerm = searchTerm;
    if (!this.searchTerm || this.searchTerm === '') {
      //getData
    }
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      AuthorizationTypeFilter: [{ value: null, disabled: false }],
      searchTerm: [{ value: null, disabled: false }]
    });
  }

  authorizationTypeChanged($event: ClaimAuthorisationsTypeEnum) {
    this.query = $event;
    this.authorisationsTypeEmit.emit($event);
  }

  openAuthorisationsDialog() {
    const dialogRef = this.dialog.open(ClaimAuthorisationsDialogComponent, {
      width: '80%',
      maxHeight: '700px',
      disableClose: true,
      data: {
        authorisationType: ClaimAuthorisationsTypeEnum[this.query],
        claimAuthorisation: this.getAuthorizarionType(),
        personEvent: this.personEvent,
        invoiceAction: 'edit',
        user: this.user
      }
    });
    dialogRef.afterClosed().subscribe(result => {
        this.authorizationTypeChanged(this.query);
    })
   }

  getAuthorizarionType() {
    switch (+ClaimAuthorisationsTypeEnum[this.query]) {
      case ClaimAuthorisationsTypeEnum.Travel:
         return new TravelAuthorisation();
      default:
        break;
    }
  }
}

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { MemberStatusEnum } from 'projects/shared-models-lib/src/lib/enums/member-status-enum';
import { DebtorStatusEnum } from 'projects/fincare/src/app/shared/enum/debtor-status.enum';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { QuoteViewDialogComponent } from 'projects/member/src/app/member-manager/views/member-home/quote-view-dialog/quote-view-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PersonEmployment } from 'projects/clientcare/src/app/policy-manager/shared/entities/person-employment';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { QuoteV2 } from 'projects/clientcare/src/app/quote-manager/models/quoteV2';
import { Person } from 'projects/clientcare/src/app/policy-manager/shared/entities/person';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'person-view',
  templateUrl: './person-view.component.html',
  styleUrls: ['./person-view.component.css']
})
export class PersonViewComponent extends UnSubscribe implements OnChanges {
  viewPermission = 'View Person';
  viewAuditPermission = 'View Audits';

  @Input() basicMode = false; // optional: use if you want to hide quick views etc
  @Input() employerRolePlayer: RolePlayer; // optional: use if you want to view the person in the context of the employer
  @Input() rolePlayer: RolePlayer; // required: pass in new roleplayer object or the rolePlayer(person) you want to view 
  @Input() tabIndex: number; // optional: sets the default tab
  @Input() defaultPolicyId: number; // optional: sets the default selected policy

  // optional: set to force override the default behavior
  @Input() title = 'Person';
  @Input() isReadOnly = false;

  @Output() employmentSelectedEmit = new EventEmitter<PersonEmployment>();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  documentSystemName = DocumentSystemNameEnum.RolePlayerDocuments;

  _new = MemberStatusEnum.New;

  today = new Date().getCorrectUCTDate();

  rolePlayerContactOptions: KeyValue<string, number>[];

  constructor(
    private readonly requiredDocumentService: RequiredDocumentService,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.rolePlayer) {
      if (!this.rolePlayer.rolePlayerId || this.rolePlayer.rolePlayerId <= 0) {
        this.rolePlayer.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
        this.rolePlayer.clientType = ClientTypeEnum.Individual;
        this.rolePlayer.memberStatus = MemberStatusEnum.New;
        this.rolePlayer.person = new Person();
        this.generateRolePlayerId();
      } else if (this.rolePlayer.rolePlayerId > 0) {
        this.rolePlayerContactOptions = [
          { key: 'Person', value: this.rolePlayer.rolePlayerId }
        ];
        this.isLoading$.next(false);
      }
    }
  }

  generateRolePlayerId() {
    this.requiredDocumentService.generateDocumentNumber('RolePlayerId').subscribe(result => {
      this.rolePlayer.rolePlayerId = +result;
      this.isLoading$.next(false);
    });
  }

  setPerson($event: RolePlayer) {
    this.rolePlayer = $event;
  }

  setPersonEmploymentSelected($event: PersonEmployment) {
    this.employmentSelectedEmit.emit($event);
  }

  openQuoteDialog($event: QuoteV2) {
    const dialogRef = this.dialog.open(QuoteViewDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '80%',
      disableClose: true,
      data: {
        quoteId: +$event.quoteId
      }
    });
  }

  getClientType(clientType: ClientTypeEnum): string {
    return this.formatText(ClientTypeEnum[clientType]);
  }

  getStatus(memberStatus: MemberStatusEnum): string {
    return this.formatText(MemberStatusEnum[memberStatus]);
  }

  getDebtorStatus(debtorStatus: DebtorStatusEnum): string {
    return this.formatText(DebtorStatusEnum[debtorStatus]);
  }

  getRolePlayerIdentificationType(rolePlayerIdentificationType: RolePlayerIdentificationTypeEnum): string {
    return this.formatText(RolePlayerIdentificationTypeEnum[rolePlayerIdentificationType]);
  }

  formatText(text: string): string {
    if (!text) { return ''; }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}

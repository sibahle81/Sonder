import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { EmailAuditSearchDataSource } from './email-audit-search.datasource';
import { EmailNotificationAuditService } from '../../email-notification-audit/email-notification-audit.service';
import { EmailAudit } from 'projects/shared-models-lib/src/lib/common/EmailAudit';
import { MatDialog } from '@angular/material/dialog';
import { EmailAuditDialogComponent } from './email-audit-dialog/email-audit-dialog.component';
import { ViewRecipientsDialogComponent } from './view-recipients-dialog/view-recipients-dialog.component';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BehaviorSubject } from 'rxjs';
import { DefaultConfirmationDialogComponent } from '../../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MemberContactDialogComponent } from '../../member-contacts/member-contact-dialog/member-contact-dialog.component';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { MailAttachementViewerDialogComponent } from '../../mail-attachement-viewer/mail-attachment-viewer-dialog/mail-attachement-viewer-dialog.component';
import { CommunicationFailureReasonDialogComponent } from '../../dialogs/communication-failure-reason-dialog/communication-failure-reason-dialog.component';
import { KeyValue } from '@angular/common';
import { RolePlayerContactOptionsDialogComponent } from './role-player-contact-options-dialog/role-player-contact-options-dialog.component';
import { ComposeNewEmailDialogComponent } from './compose-new-email-dialog/compose-new-email-dialog.component';
import { EmailRequest } from 'projects/shared-services-lib/src/lib/services/email-request/email-request';
import { SendEmailService } from 'projects/shared-services-lib/src/lib/services/email-request/send-email.service';
import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';
import { DocumentSystemNameEnum } from '../../document/document-system-name-enum';

@Component({
    selector: 'email-audit-search',
    templateUrl: './email-audit-search.component.html',
    styleUrls: ['./email-audit-search.component.css']
})

export class EmailAuditSearchComponent extends PermissionHelper implements OnInit, OnChanges {

    @Input() itemType: string; // required
    @Input() itemId: number; // required

    @Input() documentSystemName: DocumentSystemNameEnum; // optional: to be used if you want to be able to select from documents for attachments
    @Input() keyName: string; // optional: to be used if you want to be able to select from documents for attachments
    @Input() keyValue: string; // optional: to be used if you want to be able to select from documents for attachments

    @Input() rolePlayerContactOptions: KeyValue<string, number>[]; // optional: if not supplied then the additional contacts and contact selection will not be available
    
    // special case -----------------------------------------------------------------------------------------------------------
    @Input() consolidatedView: boolean = false; // optional: used only when itemType @Input is "Policy" and this input is set to true, a consolidated view of all communications are returned regardless of the indexing
    //-------------------------------------------------------------------------------------------------------------------------

    isSending$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    isSendingMessage$: BehaviorSubject<string> = new BehaviorSubject('sending...please wait');

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: EmailAuditSearchDataSource;
    form: any;

    searchTerm = '';

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly emailNotificationAuditService: EmailNotificationAuditService,
        private readonly sendEmailService: SendEmailService,
        public dialog: MatDialog,
        private readonly alertService: ToastrManager
    ) {
        super();
        this.dataSource = new EmailAuditSearchDataSource(this.emailNotificationAuditService);
    }

    ngOnInit() {
        this.createForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.dataSource.itemType = this.itemType;
        if (this.itemType === 'Policy' && this.itemId && this.consolidatedView) {
            this.dataSource.policyId = this.itemId;
            this.search(null);
        } else if (this.itemId && this.itemType) {
            this.dataSource.itemId = this.itemId;
            this.search(null);
        }
    }

    createForm(): void {
        this.form = this.formBuilder.group({
            searchTerm: [{ value: null, disabled: false }]
        });

        this.configureSearch();
    }

    configureSearch() {
        this.form.controls.searchTerm.valueChanges.pipe(debounceTime(1000)).subscribe(response => {
            this.search(response as string);
        });
    }

    search(searchTerm: string) {
        this.searchTerm = searchTerm;
        if (!this.searchTerm || this.searchTerm == '') {
            this.paginator.pageIndex = 0;
            this.getData();
        } else {
            this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
            this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
            this.getData();
        }
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    formatLookup(lookup: string) {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    reset() {
        this.dataSource.isLoading$.next(true);
        this.searchTerm = null;

        this.form.patchValue({
            searchTerm: this.searchTerm
        });
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'isSuccess', show: true },
            { def: 'subject', show: true },
            { def: 'reciepients', show: true },
            { def: 'attachments', show: true },
            { def: 'createdDate', show: true },
            { def: 'createdBy', show: true },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    view($event: EmailAudit) {
        const dialogRef = this.dialog.open(EmailAuditDialogComponent, {
            width: '70%',
            maxHeight: '700px',
            disableClose: true,
            data: {
                html: $event.body,
                isHtml: $event.isHtml
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.openConfirmationDialog($event);
            }
        });
    }

    resend($event: EmailAudit) {
        this.isSending$.next(true);
        this.isSendingMessage$.next('resending...please wait');
        this.emailNotificationAuditService.resendEmail($event).subscribe(result => {
            if (result) {
                this.alertService.successToastr('resend successful');
            } else {
                this.alertService.errorToastr('resend failed');
            }
            this.reset();
            this.isSending$.next(false);
        });
    }

    send($event: EmailRequest) {
        this.isSending$.next(true);
        this.isSendingMessage$.next('sending...please wait');
        this.sendEmailService.sendEmail($event).subscribe(result => {
            if (result == 200) {
                this.alertService.successToastr('send successful');
            } else {
                this.alertService.errorToastr('send failed');
            }
            this.reset();
            this.isSending$.next(false);
        });
    }

    getRecipentCount($event: EmailAudit): number {
        const recipients = $event.reciepients ? $event.reciepients.split(';') : [];
        return recipients.filter(s => s?.trim() !== '').length;
    }

    viewRecipients($event: EmailAudit) {
        const reciepientsTo = $event.reciepients ? $event.reciepients.split(';').filter(s => s != '') : null;
        const reciepientsCc = $event.reciepientsCc ? $event.reciepientsCc.split(';').filter(s => s != '') : null;
        const reciepientsBcc = $event.reciepientsBcc ? $event.reciepientsBcc.split(';').filter(s => s != '') : null;

        const dialogRef = this.dialog.open(ViewRecipientsDialogComponent, {
            width: '40%',
            maxHeight: '700px',
            disableClose: true,
            data: {
                reciepients: reciepientsTo,
                reciepientsCc: reciepientsCc,
                reciepientsBcc: reciepientsBcc
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.openConfirmationDialog($event);
            }
        });
    }

    openRolePlayerContactOptionsDialog($event: EmailAudit) {
        const dialogRef = this.dialog.open(RolePlayerContactOptionsDialogComponent, {
            width: '40%',
            disableClose: true,
            data: {
                rolePlayerContactOptions: this.rolePlayerContactOptions
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (+result) {
                if ($event) {
                    this.openContactsDialogResend($event, +result)
                } else {
                    this.openContactsDialogCompose(+result);
                }
            }
        });
    }

    openContactsDialogResend($event: EmailAudit, rolePlayerId: number) {
        if ($event) {
            const dialogRef = this.dialog.open(MemberContactDialogComponent, {
                width: '75%',
                disableClose: true,
                data: {
                    rolePlayerId: rolePlayerId
                }
            });

            dialogRef.afterClosed().subscribe(results => {
                if (results?.length > 0) {
                    $event.reciepients = '';
                    results.forEach(rolePlayerContact => {
                        if (rolePlayerContact.emailAddress && rolePlayerContact.emailAddress != '') {
                            $event.reciepients += rolePlayerContact.emailAddress + ';';
                        }
                    });

                    this.resend($event);
                }
            });
        }
    }

    openContactsDialogCompose(rolePlayerId: number) {
        const dialogRef = this.dialog.open(MemberContactDialogComponent, {
            width: '75%',
            disableClose: true,
            data: {
                rolePlayerId: rolePlayerId
            }
        });

        dialogRef.afterClosed().subscribe(results => {
            if (results?.length > 0) {
                let reciepients: RolePlayerContact[] = []
                results.forEach(rolePlayerContact => {
                    if (rolePlayerContact.emailAddress && rolePlayerContact.emailAddress != '') {
                        reciepients.push(rolePlayerContact);
                    }
                });

                this.openComposeNewEmailDialogComponent(reciepients);
            }
        });
    }

    openComposeNewEmailDialogComponent(reciepients: RolePlayerContact[]) {
        if (reciepients) {
            const dialogRef = this.dialog.open(ComposeNewEmailDialogComponent, {
                width: '90%',
                disableClose: true,
                data: {
                    reciepients: reciepients,
                    itemType: this.itemType,
                    itemId: this.itemId,
                    documentSystemName: this.documentSystemName, // to enable documents so that they can be selected for attachment
                    keyName: this.keyName, // to enable documents so that they can be selected for attachment
                    keyValue: this.keyValue // to enable documents so that they can be selected for attachment
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.send(result);
                }
            });
        }
    }

    openConfirmationDialog($event: EmailAudit) {
        if ($event) {
            const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
                width: '40%',
                disableClose: true,
                data: {
                    text: `Are you sure you would like to resend this email?`
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.resend($event)
                }
            });
        }
    }

    openAttachmentViewer($event: MailAttachment) {
        if ($event) {
            const dialogRef = this.dialog.open(MailAttachementViewerDialogComponent, {
                width: '70%',
                disableClose: true,
                data: {
                    mailAttachment: $event
                }
            });
        }
    }

    viewFailureReason($event: EmailAudit) {
        const dialogRef = this.dialog.open(CommunicationFailureReasonDialogComponent, {
            width: '40%',
            disableClose: true,
            data: {
                communicationFailureReason: $event.processDescription
            }
        });
    }
}

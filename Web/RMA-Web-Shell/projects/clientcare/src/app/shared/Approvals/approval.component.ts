import { Component, OnInit, ViewEncapsulation, Input, Output, ViewChild, EventEmitter, Inject } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, NavigationStart, Params } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators, NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Approval } from './approval';
import { ApprovalService } from './approval.service';
import { ApprovalTypeService } from './approvaltype.service';
import { ApprovalTypeEnum } from './approval-type-enum';
import { Client } from '../../client-manager/shared/Entities/client';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { TemplateService } from 'projects/admin/src/app/campaign-manager/shared/services/template-service';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';


@Component({
    selector: 'approval-form',
    templateUrl: './approval.component.html',
    styleUrls: ['./approval.component.css'],
    encapsulation: ViewEncapsulation.Emulated,
    inputs: ['quoteId', 'approvaltype'],
    outputs: ['isApproved']
})


export class ApprovalComponent implements OnInit {
    formData: UntypedFormGroup;
    submittedCount: number;
    // approvaltype: string;
    // quoteId: string;
    isNoteError: boolean = false;
    title = 'Loading...';
    isError = false;
    isLoadingCount = 4;
    isSubmitting = false;
    isStatutory: boolean;
    approval: Approval;
    approvalTypeEnum: ApprovalTypeEnum;
    ApprovalPage: '';
    client: Client;
    htmlApprovalContent: string = '';
    isDeclineDisabled = false;
    isApproveDisabled = false;
    isApproved = new EventEmitter<boolean>();
    homeURL = 'policy-manager';
    approvalNote = 'Liability decision has been approved';
    declineNote = 'Liability decision has been declined';

    constructor(
        public dialogRef: MatDialogRef<ApprovalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly alertService: AlertService,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly notesService: NotesService,
        private readonly approvalService: ApprovalService,
        private readonly approvalTypeService: ApprovalTypeService,
        private readonly templateService: TemplateService,
        private readonly dialog: MatDialog,
        private readonly privateLocation: Location) {
        this.formData = formBuilder.group({
            note: new UntypedFormControl('')
        });
    }
    ngOnInit() {
    }

    // action methods
    decline(): void {
        this.isApproved.emit(true);
        switch (ApprovalTypeEnum[String(this.data.approvaltype)]) {
            case ApprovalTypeEnum.UnderwritingDecision:
                {
                    let _note: Note;
                    break;
                }
            default:
        }
    }
    hasNote(): boolean {
        return true;
    }
    approve(): void {
        switch (ApprovalTypeEnum[String(this.data.approvaltype)]) {
            default:
        }
    }

    public PrepareControl(): void {
        this.formData.controls.note.setValue('');
        this.isDeclineDisabled = true;
        this.isApproveDisabled = true;

    }

    readForm(): Approval {
        const formModel = this.formData.value;
        this.approval.comment = formModel.note as string;
        return this.approval;
    }

    saveApproval(approval: Approval): void {

        let _note: Note;
        if (this.approval.comment !== undefined || null && this.approval.comment.length > 0) {
            _note = new Note();
            _note.text === this.approval.comment;
            _note.id === this.approval.id;
            this.notesService.addNote(0, _note)
                .subscribe(noteId => {
                }, error => this.error(error));
        }

    }

    error(message: any): void {
        this.isSubmitting = false;
        this.showErrorMessage(message);
    }

    showErrorMessage(error: any): void {
        this.title = 'Approval';
        this.isError = true;
        this.alertService.error(error);
    }

    generateQuote(): void{
        //TODO Not implemented in old code
    }
}

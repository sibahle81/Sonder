import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { CommonNote } from '../../../../../../../shared-models-lib/src/lib/common/common-note';
import { CommonNoteModule } from '../../../../../../../shared-models-lib/src/lib/common/common-note-module';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { CommonNotesService } from 'projects/shared-services-lib/src/lib/services/common-notes.service';

import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteCategoryEnum } from 'projects/shared-models-lib/src/lib/enums/note-category-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { NoteTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-type-enum';
import {
  GroupRiskEmployerPremiumRateModel
} from "../../../../policy-manager/shared/entities/group-risk-employer-premium-rate--model";



@Component({
  selector: 'app-group-risk-premium-rate-notes',
  templateUrl: './group-risk-premium-rate-notes.component.html',
  styleUrls: ['./group-risk-premium-rate-notes.component.css']
})
export class GroupRiskPremiumRateNotesComponent extends WizardDetailBaseComponent<GroupRiskEmployerPremiumRateModel>{

    errors: string[] = [];
    moduleType = [ModuleTypeEnum.ClientCare];
    noteCategory = NoteCategoryEnum.Policy;
    noteType = NoteTypeEnum.CaseManagement;
    noteItemType = NoteItemTypeEnum.Wizard;
    itemId: string;
    wizardId: string;

    constructor(
        authService: AuthService,
        activatedRoute: ActivatedRoute,
        appEventsManager: AppEventsManager,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly commonNotesService: CommonNotesService ) {
            super(appEventsManager, authService, activatedRoute);
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe((params: any) => {
            if (params.linkedId) {
                this.wizardId = params.linkedId;
            }
        });
    }

    createForm(id: number): void {
    }

    onLoadLookups(): void {
    }

    populateModel(): void {
    }

    populateForm(): void {
    }

    CapturedNote(commonNodeId: number){
        if(this.model)
        {
            if(!this.model?.groupRiskNotes)
            {
                this.model.groupRiskNotes = [];
            }
            const noteIndex = this.model.groupRiskNotes.indexOf(commonNodeId);
            if(noteIndex == -1)
            {
                this.model.groupRiskNotes.push(commonNodeId)
            }
        }
    }

    onValidateModel(validationResult: ValidationResult): ValidationResult {
      validationResult.errors = 0;
      validationResult.errorMessages =  [];
      return validationResult;
    }
}

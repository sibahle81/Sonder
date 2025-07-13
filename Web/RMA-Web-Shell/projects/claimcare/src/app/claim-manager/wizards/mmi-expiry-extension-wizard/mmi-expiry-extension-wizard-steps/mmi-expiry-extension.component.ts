import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { Injury } from '../../../shared/entities/injury';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { CommonNote } from 'projects/shared-models-lib/src/lib/common/common-note';
import { NoteCategoryEnum } from 'projects/shared-models-lib/src/lib/enums/note-category-enum';
import { NoteTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-type-enum';
import { CommonNoteModule } from 'projects/shared-models-lib/src/lib/common/common-note-module';
import { CommonNotesService } from 'projects/shared-services-lib/src/lib/services/common-notes.service';


@Component({
  templateUrl: './mmi-expiry-extension.component.html'
})
export class MmiExpiryExtensionComponent extends WizardDetailBaseComponent<PersonEventModel> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  selectedPersonEvent: PersonEventModel;
  selectedInjury: Injury;

  //Notes
  moduleType = [ModuleTypeEnum.ClaimCare];
  noteItemType = NoteItemTypeEnum.PersonEvent;

  isReadOnly = true;
  selectedTab = 1;
  
  constructor(
    private readonly appEventsManager: AppEventsManager,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService,
    private readonly wizardService: WizardService,
    private readonly claimService: ClaimCareService,
    private readonly commonNotesService: CommonNotesService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  onLoadLookups() { }

  createForm() { }

  populateModel() { }

  populateForm() {
    this.getEvent();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  getEvent() {
    this.claimService.getEvent(this.model.eventId).subscribe(result => {
      this.model.event = result;
      this.selectedPersonEvent = result.personEvents.find(p => p.personEventId == this.model.personEventId);
      this.isLoading$.next(false);
    });
  }

  setInjury($event: Injury) {
    this.selectedInjury = $event;
  }

  addNote(message: string) {
    const commonSystemNote = new CommonNote();
    commonSystemNote.itemId = this.selectedPersonEvent.personEventId;
    commonSystemNote.noteCategory = NoteCategoryEnum.PersonEvent;
    commonSystemNote.noteItemType = NoteItemTypeEnum.PersonEvent;
    commonSystemNote.noteType = NoteTypeEnum.SystemAdded;
    commonSystemNote.text = message;
    commonSystemNote.isActive = true;

    commonSystemNote.noteModules = [];
    const moduleType = new CommonNoteModule();
    moduleType.moduleType = ModuleTypeEnum.ClaimCare;
    commonSystemNote.noteModules.push(moduleType);

    this.commonNotesService.addNote(commonSystemNote).subscribe(result => { });
  }
}

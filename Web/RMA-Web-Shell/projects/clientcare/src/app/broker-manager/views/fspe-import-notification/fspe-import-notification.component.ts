import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { Notification } from 'projects/shared-models-lib/src/lib/common/notification';

@Component({
  selector: 'app-notification',
  templateUrl: './fspe-import-notification.component.html'
})
export class FspeNotificationComponent extends WizardDetailBaseComponent<Notification> implements OnInit {

  hasActionLink: boolean;
  actionLink: string;

  constructor(
    private readonly appEventsManager: AppEventsManager,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  onLoadLookups() { }

  createForm() {
    this.form = this.formBuilder.group({
      title: new UntypedFormControl(''),
      actionLink: new UntypedFormControl(''),
      message: new UntypedFormControl(''),
      hasBeenReadAndUnderstood: new UntypedFormControl(''),
    });
  }

  populateModel() {
    this.model.title = this.model.title;
    this.model.message = this.model.message;
    this.model.actionLink = this.model.actionLink;
    this.model.hasBeenReadAndUnderstood = this.form.value.hasBeenReadAndUnderstood as boolean;
  }

  populateForm() {
    this.form.patchValue({
      title: this.model.title,
      message: this.model.message,
      actionLink: this.model.actionLink,
      hasBeenReadAndUnderstood: this.model.hasBeenReadAndUnderstood
    });

    this.hasActionLink = !(this.model.actionLink === '');
    this.actionLink = this.model.actionLink;

    this.disableFormControl('title');
    this.disableFormControl('message');
    this.disableFormControl('actionLink');
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    const result = new ValidationResult('Has read and understood this notification');
    const hasBeenReadAndUnderstood = this.form.value.hasBeenReadAndUnderstood as boolean;
    if (!hasBeenReadAndUnderstood) {
      result.errors++;
      result.errorMessages.push('To complete this notification and remove it from yout task list, please mark it as *Read and Understood*');
    }

    return result;
  }

  disableFormControl(formControleName: string) {
    this.form.get(formControleName).disable();
  }
}

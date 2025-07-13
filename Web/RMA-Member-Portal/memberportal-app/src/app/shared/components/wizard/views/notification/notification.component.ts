import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { ValidationResult } from '../../shared/models/validation-result';
import { WizardDetailBaseComponent } from '../wizard-detail-base/wizard-detail-base.component';
import { Notification } from '../../../../models/notification.model';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent extends WizardDetailBaseComponent<Notification> implements OnInit {

  hasActionLink: boolean;
  actionLink: string;

  constructor(
    private readonly appEventsManager: AppEventsManager,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  onLoadLookups() { }

  createForm() {
    this.form = this.formBuilder.group({
      title: new FormControl(''),
      actionLink: new FormControl(''),
      message: new FormControl(''),
      hasBeenReadAndUnderstood: new FormControl(''),
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

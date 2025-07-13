import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabGroup } from '@angular/material/tabs';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { TemplateService } from 'projects/admin/src/app/campaign-manager/shared/services/template-service';
import { Template } from 'projects/admin/src/app/campaign-manager/shared/entities/template';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
	styleUrls: ['./template-details.component.css'],
	templateUrl: './template-details.component.html'
})
export class TemplateDetailsComponent extends DetailsComponent implements OnInit {

	@ViewChild(MatTabGroup, { static: false }) matTabGroup: MatTabGroup;
	templateTypes: Lookup[];
	campaignId: number;
	template: Template;

	private readonly defaultContent = '<div style=\'text-align:center;padding-top:45px;\'>[Double click to select a file or drop a file here]</div>';
	templateContent: string;

	constructor(
		appEventsManager: AppEventsManager,
		private readonly router: Router,
		private readonly alertService: AlertService,
		private readonly authService: AuthService,
		private readonly activatedRoute: ActivatedRoute,
		private readonly templateService: TemplateService,
		private readonly formBuilder: UntypedFormBuilder
	) {
		super(appEventsManager, alertService, router, 'Template', '', 1);
	}

	ngOnInit(): void {
		this.loadingStart('Loading template details...');
		this.setPermissions();
		this.loadTemplateTypes();
		this.createForm();
		this.loadTemplate();
	}

	setPermissions(): void {
		this.canAdd = userUtility.hasPermission('Add Campaign Template');
		this.canEdit = userUtility.hasPermission('Edit Campaign Template');
	}

	loadTemplateTypes(): void {
		this.templateTypes = this.templateService.getValidTemplateTypes();
	}

	loadTemplate(): void {
		this.activatedRoute.params.subscribe(
			(params: any) => {
				if (params.id) {
					this.readTemplate(params.type, params.id);
				} else {
					this.templateContent = this.defaultContent;
					this.setForm(this.getNewTemplate());
					this.loadingStop();
				}
			}
		);
	}

	getNewTemplate(): Template {
		const template = new Template();
		template.id = 0;
		template.name = '';
		template.templateType = '';
		template.templateTypeId = null;
		template.campaignTemplateType = 1;
		template.templateType = '';
		template.template = '';
		template.isActive = true;
		template.isDeleted = false;
		template.createdBy = this.authService.getUserEmail();
		template.createdDate = new Date();
		template.modifiedBy = this.authService.getUserEmail();
		template.modifiedDate = new Date();
		return template;
	}

	readTemplate(templateType: string, templateId): void {
		this.form.disable();
		this.templateService.getTemplate(templateType, templateId).subscribe(
			data => {
				this.setForm(data);
				this.templateContent = data.template;
				this.removeTemplateTypes(data.campaignTemplateType);
				this.loadingStop();
			}
		);
	}

	removeTemplateTypes(typeId: number): void {
		this.templateTypes = this.templateTypes.filter(
			template => template.id === typeId
		);
	}

	createForm(): void {
		this.clearDisplayName();
		this.form = this.formBuilder.group(
			{
				id: 0,
				templateName: new UntypedFormControl('', [Validators.required]),
				templateTypeId: new UntypedFormControl('', [Validators.required, Validators.min(1)]),
				template: new UntypedFormControl('', [Validators.required])
			}
		);
	}

	setForm(template: Template): void {
		this.template = template;
		this.form.setValue({
			id: template.id ? template.id : 0,
			templateName: template.name ? template.name : '',
			templateTypeId: template.campaignTemplateType ? template.campaignTemplateType : 0,
			template: template.template ? template.template : ''
		});
	}

	readForm(): void {
		const model = this.form.value;
		this.template.id = model.id as number;
		this.template.name = model.templateName;
		this.template.campaignTemplateType = model.templateTypeId as number;
		this.template.template = model.template;
	}

	pasteTemplate(item: any) {
		if (!this.form.enabled) { return; }
		if (item === this.defaultContent) { item = ''; }
		item = item.trim();
		this.form.controls.template.markAsDirty();
		this.form.controls.template.setValue(item);
		this.templateContent = item === '' ? this.defaultContent : item;
	}

	clearTemplate(item: any): void {
		switch (item.value) {
			case 1:
				this.templateContent = this.defaultContent;
				break;
			case 2:
				this.form.controls.template.setValue('');
				break;
		}
	}

	selectTemplate(item: any) {
		if (!this.form.enabled) { return; }
		const dialog = document.createElement('input');
		dialog.addEventListener('change', () => {
			this.loadFileTemplate(dialog.files[0]);
		}, false);
		dialog.type = 'file';
		dialog.accept = '.htm,.html,.txt';
		dialog.multiple = false;
		dialog.click();
	}

	loadFileTemplate(file: File): void {
		const reader = new FileReader();
		reader.onload = () => {
			const content = reader.result;
			this.pasteTemplate(content);
		};
		reader.onerror = (error) => {
			this.alertService.error(`Error loading template: ${file.name}`);
		};
		reader.readAsText(file);
	}

	dropTemplate(item: any): void {
		item.stopPropagation();
		item.preventDefault();
		if (!this.form.enabled) { return; }
		const data = item.dataTransfer;
		if (data.types && data.types[0] === 'Files') {
			this.loadFileTemplate(data.files[0]);
		}
	}

	dragEnter(item: any): void {
		item.stopPropagation();
		item.preventDefault();
	}

	dragOver(item: any): void {
		item.stopPropagation();
		item.preventDefault();
	}

	dragLeave(item: any): void {
		item.stopPropagation();
		item.preventDefault();
	}

	edit(): void {
		this.form.enable();
	}

	clearCurrentTemplate(): void {
		this.templateContent = this.defaultContent;
		this.form.controls.template.setValue('');
		this.form.controls.template.markAsDirty();
	}

	save(): void {
		if (!this.form.valid) { return; }
		this.form.disable();
		this.readForm();
		this.loadingStart('Saving campaign template...');
		if (this.template.id > 0) {
			this.editTemplate(this.template);
		} else {
			this.insertTemplate(this.template);
		}
	}

	insertTemplate(template: Template): void {
		const api = this.getApiController(template.campaignTemplateType);
		this.templateService.addTemplate(api, template).subscribe(
			data => {
				this.template.id = data;
				this.done();
			}
		);
	}

	editTemplate(template: Template): void {
		const api = this.getApiController(template.campaignTemplateType);
		this.templateService.editTemplate(api, template).subscribe(
			() => {
				this.done();
			}
		);
	}

	getApiController(templateTypeId: number) {
		switch (templateTypeId) {
			case 1: return 'Email';
			case 2: return 'Sms';
			default: return 'Invalid';
		}
	}

	done(): void {
		this.loadingStop();
		this.alertService.success('Template has been saved successfully.', 'Campaign Template');
		this.back();
	}

	back(): void {
		this.router.navigate(['campaign-manager/find-template']);
	}
}

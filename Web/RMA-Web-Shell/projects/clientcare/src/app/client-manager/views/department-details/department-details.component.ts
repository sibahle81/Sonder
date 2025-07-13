import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { ActionParameters } from 'projects/clientcare/src/app/client-manager/shared/Entities/action-parameters';
import { ActionType } from 'projects/clientcare/src/app/client-manager/shared/Enums/action-type.enum';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DepartmentService } from 'projects/clientcare/src/app/client-manager/shared/services/department.service';
import { Department } from 'projects/clientcare/src/app/client-manager/shared/Entities/department';
import { ItemType } from 'projects/clientcare/src/app/client-manager/shared/Enums/item-type.enum';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BreadcrumbClientService } from 'projects/clientcare/src/app/client-manager/shared/services/breadcrumb-client.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
    templateUrl: './department-details.component.html'
})
export class DepartmentDetailsComponent extends DetailsComponent implements OnInit {
    actionParameters: ActionParameters;

    constructor(

        private readonly breadcrumbService: BreadcrumbClientService,
        private readonly alertService: AlertService,
        private readonly router: Router,
        private readonly appEventsManager: AppEventsManager,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly activatedRoute: ActivatedRoute,
        private readonly departmentService: DepartmentService) {

        super(appEventsManager, alertService, router, 'Department', '', 1);
        this.isWizard = false;
    }

    ngOnInit() {
        this.resetPermissions();
        this.createForm();

        this.activatedRoute.params.subscribe((params: any) => {
            if (this.isWizard) {
                return;
            } else if (params.action === 'add') {
                this.actionParameters = new ActionParameters(params.id, ActionType.Add, params.clientId, '');
                this.checkUserAddPermission();
                this.breadcrumbService.setSubClientBreadcrumb('Add a department', params.id);
            } else {
                this.loadingStart('Loading department details...');
                this.actionParameters = new ActionParameters(params.id, ActionType.Edit, params.clientId, '');
                this.getDepartment(params.id);
            }
        });
    }

    checkUserAddPermission(): void {
        this.canAdd = userUtility.hasPermission('Add Department');
    }

    createForm(): void {
        if (this.form) { return; }

        this.form = this.formBuilder.group({
            id: new UntypedFormControl(0),
            addressId: null,
            clientId: new UntypedFormControl(0),

            name: new UntypedFormControl('', [Validators.required]),
        });
    }

    readForm(): Department {
        const formModel = this.form.value;
        const department = new Department();

        department.id = formModel.id as number;
        department.addressId = formModel.addressId as number;
        department.clientId = formModel.clientId as number;

        department.name = formModel.name as string;
        return department;
    }

    setForm(department: Department) {
        if (!this.form) { this.createForm(); }
        this.canEdit = department.canEdit;

        this.form.setValue({
            id: department.id,
            addressId: department.addressId,
            clientId: department.clientId,

            name: department.name ? department.name : '',
        });

        this.form.disable();
        this.getDisplayName(department);
        this.appEventsManager.loadingStop();
    }

    getDepartment(id: number): void {
        this.departmentService.getDepartment(id).subscribe(department => {
            this.setForm(department);
            this.getNotes(id, ServiceTypeEnum.ClientManager, 'Department');
            this.getAuditDetails(id, ServiceTypeEnum.ClientManager, ItemType.Department);
            this.breadcrumbService.setSubClientBreadcrumb('Edit a department', department.clientId);
        });
    }

    save(): void {
        if (this.isFormInvalid) { return; }

        this.form.disable();
        const department = this.readForm();
        this.loadingStart(`Saving ${department.name}...`);

        if (this.actionParameters.actionType === ActionType.Add) {
            this.addDepartment(department);
        } else {
            this.editDepartment(department);
        }
    }

    addDepartment(department: Department): void {
        department.clientId = this.actionParameters.id;
        this.departmentService.addDepartment(department).subscribe(() => this.done());
    }

    editDepartment(department: Department): void {
        this.departmentService.editDepartment(department).subscribe(() => this.done());
    }

    done(): void {
        this.appEventsManager.loadingStop();
        this.alertService.success(`'${this.form.value.name}' was saved successfully`, 'Department saved', true);
        this.back();
    }

    back(): void {
        if (this.actionParameters.actionType === ActionType.Add) {
            this.router.navigate([`/clientcare/client-manager/client-details/${this.actionParameters.id}/3`]);
        } else {
            this.router.navigate([`/clientcare/client-manager/client-details/${this.form.value.clientId}/3`]);
        }
    }

    setCurrentValues(): void {
    }
}

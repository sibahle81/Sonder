import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { ActionParameters } from 'projects/clientcare/src/app/client-manager/shared/Entities/action-parameters';
import { ActionType } from 'projects/clientcare/src/app/client-manager/shared/Enums/action-type.enum';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BranchService } from 'projects/clientcare/src/app/client-manager/shared/services/branch.service';
import { Branch } from 'projects/clientcare/src/app/client-manager/shared/Entities/branch';
import { ItemType } from 'projects/clientcare/src/app/policy-manager/shared/enums/item-type';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BreadcrumbClientService } from 'projects/clientcare/src/app/client-manager/shared/services/breadcrumb-client.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
    templateUrl: './branch-details.component.html'
})
export class BranchDetailsComponent extends DetailsComponent implements OnInit {
    actionParameters: ActionParameters;

    constructor(
        private readonly breadcrumbService: BreadcrumbClientService,
        private readonly alertService: AlertService,
        private readonly router: Router,
        private readonly appEventsManager: AppEventsManager,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly activatedRoute: ActivatedRoute,
        private readonly branchService: BranchService) {

        super(appEventsManager, alertService, router, 'Branch', '', 1);
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
                this.breadcrumbService.setSubClientBreadcrumb('Add a branch', params.id);
                this.checkUserAddPermission();

            } else {
                this.loadingStart('Loading branch details...');
                this.actionParameters = new ActionParameters(params.id, ActionType.Edit, params.clientId, '');
                this.getBranch(params.id);
            }
        });
    }

    checkUserAddPermission(): void {
        this.canAdd = userUtility.hasPermission('Add Branch');
    }

    createForm(): void {
        this.clearDisplayName();
        if (this.form) { return; }

        this.form = this.formBuilder.group({
            id: new UntypedFormControl(0),
            addressId: null,
            clientId: new UntypedFormControl(0),

             name: new UntypedFormControl('', [Validators.required])
        });
    }

    readForm(): Branch {
        const formModel = this.form.value;
        const branch = new Branch();

        branch.id = formModel.id as number;
        branch.addressId = formModel.addressId as number;
        branch.clientId = formModel.clientId as number;

        branch.name = formModel.name as string;

        return branch;
    }

    setForm(branch: Branch) {
        if (!this.form) { this.createForm(); }
        this.canEdit = branch.canEdit;

        this.form.setValue({
            id: branch.id,
            addressId: branch.addressId,
            clientId: branch.clientId,

            name: branch.name ? branch.name : '',
        });

        this.form.disable();
        this.getDisplayName(branch);
        this.appEventsManager.loadingStop();
    }

    getBranch(id: number): void {
        this.branchService.getBranch(id).subscribe(branch => {
            this.setForm(branch);
            this.getNotes(id, ServiceTypeEnum.ClientManager, 'Branch');
            this.getAuditDetails(id, ServiceTypeEnum.ClientManager, ItemType.Branch);
            this.breadcrumbService.setSubClientBreadcrumb('Edit a branch', branch.clientId);
        });
    }

    save(): void {
        if (this.isFormInvalid) { return; }

        this.form.disable();
        const branch = this.readForm();
        this.loadingStart(`Saving ${branch.name}...`);

        if (this.actionParameters.actionType === ActionType.Add) {
            this.addBranch(branch);
        } else {
            this.editBranch(branch);
        }
    }

    addBranch(branch: Branch): void {
        branch.clientId = this.actionParameters.id;
        this.branchService.addBranch(branch).subscribe(() => this.done());
    }

    editBranch(branch: Branch): void {
        this.branchService.editBranch(branch).subscribe(() => this.done());
    }

    done(): void {
        this.appEventsManager.loadingStop();
        this.alertService.success(`'${this.form.value.name}' was saved successfully`, 'Branch saved', true);
        this.back();
    }

    back(): void {
        if (this.actionParameters.actionType === ActionType.Add) {
            this.router.navigate([`/clientcare/client-manager/client-details/${this.actionParameters.id}/2`]);
        } else {
            this.router.navigate([`/clientcare/client-manager/client-details/${this.form.value.clientId}/2`]);
        }
    }

    setCurrentValues(): void {
    }
}

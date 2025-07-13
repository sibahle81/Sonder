import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { GroupService } from '../../shared/services/group.service';
import { Group } from '../../shared/Entities/group';
import { Contact } from '../../shared/Entities/contact';
import { GroupClientListComponent } from '../group-client-list/group-client-list.component';
import { GroupClientListDatasource } from '../group-client-list/group-client-list.datasource';
import { ContactService } from '../../shared/services/contact.service';
import { MatTabGroup } from '@angular/material/tabs';
import { BankAccount } from '../../shared/Entities/bank-account';
import { BankAccountListComponent } from '../bank-account-list/bank-account-list.component';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ItemType } from '../../shared/Enums/item-type.enum';
import { BreadcrumbClientService } from '../../shared/services/breadcrumb-client.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
    templateUrl: './group-details.component.html',
    selector:'group-account-list'
})


export class GroupDetailsComponent extends DetailsComponent implements OnInit, AfterViewInit {
    @ViewChild(GroupClientListComponent, { static: true }) groupClientListComponent: GroupClientListComponent;
    @ViewChild(GroupClientListDatasource, { static: false }) groupClientListDatasource: GroupClientListDatasource;
    @ViewChild(MatTabGroup, { static: true }) matTabGroup: MatTabGroup;
    @ViewChild(BankAccountListComponent, { static: true }) bankAccountListComponent: BankAccountListComponent;
    currentName = '';
    currentRegistrationNumber = '';
    currentGroup: Group;
    currentBankAccount: BankAccount;
    currentContactId: number;
    tabIndex: number;
    groupRequest = false;
    titles: Lookup[];
    groupId: number;
    personTitleId:number;
    isSubmitting: boolean;
    itemType:ItemType;
    itemId:number;
    Group:Group;

    constructor(
        private readonly breadcrumbService: BreadcrumbClientService,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly location: Location,
        private readonly router: Router,
        private readonly alertService: AlertService,
        private readonly appEventsManager: AppEventsManager,
        private readonly activatedRoute: ActivatedRoute,
        private readonly lookupService: LookupService,
        private readonly groupService: GroupService,
        private readonly contactService: ContactService
       ) {

        super(appEventsManager, alertService, router, 'Group', 'admin-manager', 1);
        this.isWizard = false;
    }

    ngOnInit() {

        this.resetPermissions();
        this.getPersonTitles();
        this.activatedRoute.params.subscribe((params: any) => {
            if (params.tabIndex) { this.tabIndex = params.tabIndex; }
            if (params.id) {
                this.loadingStart('Loading group details...');
                this.createForm();
                this.form.disable();
                this.getGroup(params.id);
                this.breadcrumbService.setBreadcrumb('Edit a group');

            } else {
                this.createForm();
                this.breadcrumbService.setBreadcrumb('Add a group');
            }
        });
    }

    ngAfterViewInit(): void {
        if (this.tabIndex) { this.matTabGroup.selectedIndex = this.tabIndex; }
    }

    getPersonTitles(): void {
        this.lookupService.getTitles().subscribe(
            data => {
                this.titles = data;
            });
    }

    checkUserAddPermission(): void {
        this.canAdd = userUtility.hasPermission('Add Group');
    }

    createForm(): void {
        this.form = this.formBuilder.group({
            id: 0,
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            description: ['', [Validators.required]],
            registrationNumber: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^\d{4}\/\d{6}\/\d{2}$/)]],
            contactPerson: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            telephoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
            mobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
            title: [null, [Validators.required]],
            designation : ['', [Validators.required]]
        });

        this.bankAccountListComponent.clearData();
    }

    readForm(): Group {
        const formModel = this.form.value;
        const group = new Group();

        group.id = formModel.id as number;
        group.description = formModel.description as string;
        group.name = formModel.name as string;
        group.registrationNumber = formModel.registrationNumber as string;

        group.contact = new Contact();
        group.contact.id = this.currentContactId;
        group.contact.email = formModel.email as string;
        group.contact.telephoneNumber = formModel.telephoneNumber as string;
        group.contact.mobileNumber = formModel.mobileNumber as string;
        group.contact.personTitleId = formModel.title as number;
        group.contact.designation = formModel.designation as string;
        group.contact.name = formModel.contactPerson as string;

        return group;
    }

    setForm(group: Group) {
        if (!this.form) { this.createForm(); }
        if (group == null) { this.createForm(); }
        this.canEdit = group.canEdit;

        this.form.setValue({
            id: group.id ? group.id : 0,
            name: group.name ? group.name : '',
            description: group.description ? group.description : '',
            registrationNumber: group.registrationNumber ? group.registrationNumber : '',
            contactPerson: group.contact ? group.contact.name : '',
            email: group.contact ? group.contact.email : '',
            telephoneNumber: group.contact ? group.contact.telephoneNumber : '',
            mobileNumber: group.contact ? group.contact.mobileNumber : '',
            title: group.contact ? group.contact.personTitleId : 0,
            designation: group.contact ? group.contact.designation : ''
        });

        this.loadingStop();
        this.getDisplayName(group);
    }

    getGroup(id: number): void {
        this.groupService.getGroup(id)
            .subscribe(group => {
                const bankDetails = new Array();
                bankDetails.push(group.id);
                bankDetails.push('Group');
                this.currentGroup = group;
                this.groupId = group.id;
                this.bankAccountListComponent.itemId = group.id;
                this.bankAccountListComponent.getData(bankDetails);
                this.currentName = group.name.toLowerCase();
                this.currentRegistrationNumber = group.registrationNumber.toLowerCase();
                this.contactService.getContactByItemType('Group', group.id).subscribe(contact => {
                    group.contact = contact ? contact[0] : null;
                    this.currentContactId = group.contact ? group.contact.id : null;
                    this.setForm(group);
                    this.loadingStop();
                });

            });
        this.getNotes(id, ServiceTypeEnum.ClientManager, 'Group');
        this.getAuditDetails(id, ServiceTypeEnum.ClientManager, ItemType.Group);

    }

    populateClientGroups(id: number): void {
        this.groupClientListComponent.getData(id);
    }

    save(): void {
        if (!this.form.valid) { return; }

        this.form.disable();
        const group = this.readForm();

        this.loadingStart(`Saving group ${group.name}...`);

        if (group.id > 0) {
            this.editGroup(group);
        } else {
            this.addGroup(group);
        }
    }

    edit(): void {
        this.submittedCount = 0;
        this.form.enable();
        this.form.get('registrationNumber').disable();
        this.setCurrentValues();
    }

    setCurrentValues(): void {
        this.currentName = this.form.value.name.toLowerCase();
    }

    newItem(): void {
        this.router.navigate(['group-details/add']);
    }

    editGroup(group: Group): void {
        this.groupService.editGroup(group).subscribe(() => {
            this.addOrEditContact(group);
        });
    }

    addGroup(group: Group): void {
        this.groupService.addGroup(group).subscribe((groupId) => {
            group.id = groupId;
            this.addOrEditContact(group);
        });
    }

    addOrEditContact(group: Group): void {
        if (group.contact.id > 0) {
            group.contact.itemId = group.id;
            group.contact.itemType = 'Group';
            this.contactService.editContact(group.contact).subscribe(() => this.done());
        } else {
            const contact = group.contact;
            contact.itemId = group.id;
            contact.itemType = 'Group';
            contact.contactTypeId = 5;
            this.contactService.addContact(contact).subscribe(() =>
                this.isDone(group.name));
        }
    }

    addBank(): void {
        this.router.navigate([`clientcare/client-manager/bank-account-details/add/${this.currentGroup.id}/Group`]);
    }

    viewBank(): void {
        this.router.navigate(['clientcare/client-manager/bank-account-details/edit', this.currentGroup.id, 'Group', this.currentGroup.bankAccountId]);
    }


    get hasBankAccount(): boolean {
        return  (this.currentGroup != null && (this.currentGroup.bankAccountId > 0));
    }

    get hasGroup(): boolean {
        return (this.currentGroup != null);
    }


    addAddress(): void {
        this.router.navigate([`clientcare/client-manager/address-details/group/${this.currentGroup.id}/add`]);
    }

    viewAddress(): void {
        this.router.navigate(['clientcare/client-manager/address-details/group', this.currentGroup.id, 'edit', this.currentGroup.addressId]);
    }


    get hasAddress(): boolean {
        return (this.currentGroup != null && (this.currentGroup.addressId > 0));
    }

    done(): void {
        this.appEventsManager.loadingStop();
        this.alertService.success(`Group has been updated successfully`, 'Group', true);
        this.back();
    }

    isDone(value: string): void {
        this.appEventsManager.loadingStop();
        this.alertService.success(`Group has been added successfully`, 'Group', true);
        this.router.navigate(['clientcare/client-manager/group-list']);
    }

    back(): void {
        this.location.back();
    }
}

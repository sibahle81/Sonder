import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { Client } from 'projects/clientcare/src/app/client-manager/shared/Entities/client';
import { UploadFile } from 'projects/shared-components-lib/src/lib/upload-control/upload-file.class';
import { RegistrationData } from '../../shared/entities/registration-data';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { Contact } from 'projects/clientcare/src/app/client-manager/shared/Entities/contact';

@Component({
    templateUrl: './portal-user-details.component.html'
})
export class PortalUserDetailsComponent extends DetailsComponent implements OnInit {
    currentEmail = '';
    currentUserId: number;
    isCurrentUser = false;
    personTitles: Lookup[];
    contactTypes: Lookup[];
    contact: Contact;
    user: User;
    client: Client;
    uploadFileList: UploadFile[];
    registrationData: RegistrationData;
    matcher: any;
    contactType: Lookup;
    titleId: number;


    constructor(
        private readonly authService: AuthService,
        alertService: AlertService,
        appEventsManager: AppEventsManager,
        private readonly userService: UserService,
        private readonly lookupService: LookupService,
        private readonly activatedRoute: ActivatedRoute,
        router: Router,
        private readonly formBuilder: UntypedFormBuilder) {

        super(appEventsManager, alertService, router, 'PortalUser', 'user-manager', 1);
    }

    ngOnInit(): void {
        this.getContactTypes();
        this.getPersonTitles();

        this.activatedRoute.params.subscribe((params: any) => {
            if (params.id) {
                this.loadingStart('Loading user details...');
                this.createForm(params.id);
                // this.getUser(params.id);
                this.form.disable();
                // this.breadcrumbService.setBreadcrumb('Edit a user');
            } else {
                this.createForm('');
                // this.breadcrumbService.setBreadcrumb('Add a user');
            }
        });
    }

    getContactTypes(): void {
        this.lookupService.getContactTypes().subscribe(
            data => {
                this.contactTypes = data;
            });
    }

    getPersonTitles(): void {
        this.lookupService.getTitles().subscribe(
            data => {
                this.personTitles = data;
            });
    }

    readForm(): RegistrationData {

        // if (formModel.contactName == null && formModel.name == null && formModel.email == null) {
        return this.registrationData;
        // }
        /*
        let user = new User();
        user.id = formModel.id as number;
        user.displayName = formModel.contactName;
        user.email = formModel.email;
        user.name = formModel.contactName;
        user.password = formModel.password;

        let client = new Client();
        client.clientFullName = formModel.name;
        client.referenceNumber = formModel.referenceNumber;
        client.registrationNumber = formModel.registrationNumber;

        let contact = new Contact();
        contact.name = formModel.contactName;
        contact.telephoneNumber = formModel.telephoneNumber;
        contact.mobileNumber = formModel.mobileNumber;
        contact.contactTypeId = formModel.contactTypeId;
        contact.email = formModel.email;

        registrationData.user = user;
        registrationData.client = client;
        registrationData.contact = contact;
        //registrationData.uploadFileList = formModel.uploadFileList;

        return registrationData;*/
    }

    getUser(): User {
        const formModel = this.form.value;
        const user = new User();

        user.id = formModel.id as number;
        user.displayName = formModel.displayName;
        user.email = formModel.email;
        user.roleId = formModel.role;
        user.isActive = formModel.userStatus;

        return user;
    }

    getContact(): Contact {
        const formModel = this.form.value;
        const contact = new Contact();

        contact.id = formModel.id as number;
        contact.contactTypeId = formModel.contactType;
        contact.email = formModel.email;
        contact.mobileNumber = formModel.mobileNumber;
        contact.name = formModel.name;
        contact.personTitleId = formModel.personTitleId;
        contact.telephoneNumber = formModel.telephoneNumber;

        return contact;
    }

    getClient(): Client {
        const formModel = this.form.value;
        const client = new Client();

        client.id = formModel.id as number;
        client.referenceNumber = formModel.referenceNumber;
        client.registrationNumber = formModel.registrationNumber;
        client.name = formModel.companyName;

        return client;
    }

    setForm(registrationData: RegistrationData) {
        // if (!this.form) this.createForm(registrationData.user.id);
        if (registrationData.user == null) { this.createForm(''); }

        this.form.setValue({
            id: 0,
            referenceNumber: registrationData.client ? registrationData.client.referenceNumber : '',
            registrationNumber: registrationData.client ? registrationData.client.registrationNumber : '',
            personTitleId: registrationData.contact ? registrationData.contact.personTitleId : 0,
            idNumber: registrationData.client ? registrationData.client.idNumber : '',
            contactName: registrationData.contact ? registrationData.contact.name : '',
            contactType: registrationData.contact ? registrationData.contact.contactTypeId : '',
            telephoneNumber: registrationData.contact ? registrationData.contact.telephoneNumber : '',
            mobileNumber: registrationData.contact ? registrationData.contact.mobileNumber : '',
            personTitle: registrationData.contact ? registrationData.contact.personTitleId : '',
            password: registrationData.user ? registrationData.user.password : '',
            name: registrationData.client.name ? registrationData.client.name : '',
            email: registrationData.contact ? registrationData.contact.email : ''
        });

        this.registrationData = registrationData;

        this.uploadFileList = registrationData.uploadFileList ? registrationData.uploadFileList : new Array(new UploadFile());
        this.getDisplayName(registrationData.user);
    }

    setCurrentValues(): void {
        // this.currentEmail = this.form.value.email.toLowerCase();
    }

    save(): void {
        if (this.form.invalid) { return; }
        if (this.isCurrentUser) { return; }

        this.form.disable();
        // this.loadingStart(`Saving ${user.displayName}...`);

        if (this.form.value.id > 0) {
            // this.editUser(user);
        } else {
            // this.addUser(user);
        }
    }

    editUser(user: User): void {
        this.userService.editUser(user).subscribe(() => this.done(user.displayName));
    }

    addUser(user: User): void {
        this.userService.addUser(user).subscribe(() => this.done(user.displayName));
    }

    checkCurrentUser(user: User): void {
        this.currentUserId = this.authService.getCurrentUser().id;
        this.isCurrentUser = user.id === this.currentUserId;
    }

    statusChange(e: any) {
        this.form.value.userStatus = e.checked;
    }

    createForm(id: any): void {
        this.clearDisplayName();
        if (this.form) { return; }

        this.form = this.formBuilder.group({
            id,
            referenceNumber: new UntypedFormControl({ value: '' }, [
            ]),
            name: new UntypedFormControl({ value: '' }, [
                Validators.required
            ]),
            registrationNumber: new UntypedFormControl({ value: '' }, [
                // Validators.required
            ]),
            personTitleId: new UntypedFormControl({ value: 0 }, [
                Validators.required
            ]),
            idNumber: new UntypedFormControl({ value: '' }, [
                // Validators.required//, Validators.pattern(this.client.idNumberRegex)
            ]),
            contactName: new UntypedFormControl({ value: '' }, [
                Validators.required
            ]),
            contactType: new UntypedFormControl({ value: 0 }, [
                Validators.required
            ]),
            email: new UntypedFormControl({ value: '' }, [
                Validators.required, Validators.email// , Validators.pattern(this.client.emailRegex)
            ]),
            telephoneNumber: new UntypedFormControl({ value: '' }, [
                Validators.required, Validators.minLength(10)// , Validators.pattern(this.client.phoneNumberRegex)
            ]),
            mobileNumber: new UntypedFormControl({ value: '' }, [
                Validators.required, Validators.minLength(10)// , Validators.pattern(this.client.phoneNumberRegex)
            ]),
            personTitle: new UntypedFormControl({ value: 0 }, [
                Validators.required
            ]),
            password: new UntypedFormControl({ value: '' }, [
                Validators.required
            ])
        });
    }
}

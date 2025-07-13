import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators} from '@angular/forms';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { RoleService } from './../../../../../../shared-services-lib/src/lib/services/security/role/role.service';
import { Announcement } from 'projects/shared-models-lib/src/lib/common/announcement';
import { AnnouncementRole } from 'projects/shared-models-lib/src/lib/common/announcement-role';
import { AnnouncementsDataSource } from './announcements.datasource';
import { AnnouncementService } from 'projects/shared-services-lib/src/lib/services/announcement/announcement.service';
import { AnnouncementRoleService } from 'projects/shared-services-lib/src/lib/services/announcement/announcement-role.service';

@Component({
    templateUrl: './announcement-details.component.html',
    styleUrls: ['./announcement-details.component.css'],
})
export class AnnouncementDetailsComponent extends DetailsComponent implements OnInit {    
    mode: string;
    showDetails: number;
    showEditBtn: number;
    showRoles: number;
    includeAllRoles: boolean;
    rolesEdited: number;
    roles: Role[];
    announcement: Announcement;
    announcementRoles: AnnouncementRole[];
    selectedRoles: number[];

    constructor(
        public readonly dataSource: AnnouncementsDataSource,
        public readonly alertService: AlertService,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly router: Router,
        private readonly roleService: RoleService,
        private readonly announcementService: AnnouncementService,
        private readonly announcementRoleService: AnnouncementRoleService,
        appEventsManager: AppEventsManager) {
        super(appEventsManager, alertService, router, 'Announcements', 'config-manager/announcements/', 0);
    }

    ngOnInit() {
        this.showDetails = 0;
        this.showEditBtn = 0;
        this.showRoles = 0;
        this.selectedRoles = [];
        this.rolesEdited = 0;
        this.createForm(0);
    }

    ngOnDestroy() {
    }

    createForm(id: any): void {
        const date =  new Date();
        this.form = this.formBuilder.group({
            id,
            name: new UntypedFormControl('', [Validators.required, Validators.minLength(3)]),
            description: new UntypedFormControl('', Validators.required),
            html: new UntypedFormControl('', Validators.required),
            isMandatory: new UntypedFormControl(true),
            includeAllRoles: new UntypedFormControl(true),
            priority: new UntypedFormControl('', [Validators.required, Validators.min(1), Validators.max(5)]),            
            startDate: new UntypedFormControl(date, Validators.required),
            endDate: new UntypedFormControl('', Validators.required)
        });
    }

    setForm(announcement: Announcement): void {
        if (!this.form) 
            this.createForm(announcement.announcementId);
            
        this.form.controls.name.setValue(announcement.name);
        this.form.controls.description.setValue(announcement.description);
        this.form.controls.html.setValue(announcement.html);
        this.form.controls.isMandatory.setValue(announcement.isMandatory);
        this.form.controls.includeAllRoles.setValue(announcement.includeAllRoles);
        this.form.controls.priority.setValue(announcement.priorityId);
        this.form.controls.startDate.setValue(announcement.startDate);
        this.form.controls.endDate.setValue(announcement.endDate);
        this.announcement = announcement;

        this.mode = 'Edit';
        this.showDetails = 1;
        if(!this.announcement.includeAllRoles) {
            this.showRoles = 1;
            this.getRoles();
            this.announcementRoleService.getAnnouncementRolesByAnnouncementId(this.announcement.announcementId).subscribe(data => {
                for(let i = 0; i < data.length; i++) {
                    this.selectedRoles.push(data[i].roleId);
                }
            });
        }
    }

    readForm(): Announcement {
        const formModel = this.form.value;
        const announcement = new Announcement();
        if(this.announcement.announcementId != undefined)
            announcement.announcementId = this.announcement.announcementId;
        else
            announcement.announcementId = 0;
        announcement.name = formModel.name;
        announcement.description = formModel.description;
        announcement.html = formModel.html;
        announcement.isMandatory = formModel.isMandatory;
        announcement.includeAllRoles = this.includeAllRoles = formModel.includeAllRoles;
        announcement.priorityId = formModel.priority;
        announcement.startDate = formModel.startDate;
        announcement.endDate = formModel.endDate;        
        return announcement;
    }

    save() {
        if (this.form.invalid) 
            return; 

        const announcement = this.readForm();
        if (new Date(announcement.endDate).toLocaleDateString() != new Date(announcement.startDate).toLocaleDateString()
                && new Date(announcement.endDate) < new Date(announcement.startDate)) {
            this.alertService.error('End date cannot be before start date.');
            return;
        }

        const announcementRoles = this.selectedRoles;
        if (!this.includeAllRoles && announcementRoles.length <= 0) {
            this.alertService.error('Please select atleast one role.');
            return;
        }

        this.loadingStart(`Saving announcement...`);

        if (this.mode === 'Add') { 
            this.announcementService.addAnnouncement(announcement).subscribe((value) => {                
                const announcementRole = new AnnouncementRole();
                announcementRole.announcementId = value;                
                if (!this.includeAllRoles && announcementRoles.length > 0) {
                    for (var roleId of announcementRoles) {
                        announcementRole.roleId = roleId;
                        this.announcementRoleService.addAnnouncementRole(announcementRole).subscribe(() => {});
                    }
                }
                this.alertService.success('Announcement successfully saved.');
                this.loadingStop();
                location.reload();
            });
        }
        else if (this.mode === 'Edit') {
            this.announcementService.editAnnouncement(announcement).subscribe(() => {
                if (this.includeAllRoles || this.rolesEdited) {
                    this.announcementRoleService.removeAnnouncementRolesByAnnouncementId(announcement.announcementId).subscribe(() => {});
                    if (this.rolesEdited && announcementRoles.length > 0) {
                        const announcementRole = new AnnouncementRole();
                        announcementRole.announcementId = announcement.announcementId;
                        for (var roleId of announcementRoles) {
                            announcementRole.roleId = roleId;
                            this.announcementRoleService.addAnnouncementRole(announcementRole).subscribe(() => {});
                        }
                    }
                }
                this.alertService.success('Announcement successfully updated.');
                this.loadingStop();
                location.reload();            
            });
        }
    }

    edit(): void {
        this.form.enable();
        this.showEditBtn = 0;
    }

    clear() {
        this.showDetails = 0;
    }

    addNew() {
        this.createForm(0);
        this.announcement = new Announcement();
        this.showDetails = 1;
        this.mode = 'Add';
    }

    backToSearch() {
        this.router.navigate(['config-manager/']);
    }

    announcementChangeHandler(announcement: Announcement): void {
        this.showDetails = 1;
        this.mode = 'Edit';
        this.showEditBtn = 1;
        this.setForm(announcement);
        this.form.disable();
    }

    includeAllRolesChange(e: any): void {
        this.includeAllRoles = e.checked;
        if(!this.includeAllRoles){
            this.showRoles = 1;
            this.getRoles();
        }
        else {
            this.showRoles = 0;
            this.selectedRoles = [];
        }
    }

    getRoles() {
        this.roleService.getRoles().subscribe(data => {
            this.roles = data;
        });
    }

    onSelect(item: any) {
        this.rolesEdited = 1;
        if (item.checked) {
          this.selectedRoles.push(parseInt(item.value));
        }
        else {
          const index = this.selectedRoles.indexOf(parseInt(item.value));
          if (index > -1) {
           this.selectedRoles.splice(index, 1);
          }          
        }
    }
}

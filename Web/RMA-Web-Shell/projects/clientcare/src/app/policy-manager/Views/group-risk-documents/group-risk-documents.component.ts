    import { Component } from '@angular/core';
    import { ActivatedRoute } from '@angular/router';
    import { MatDialog } from '@angular/material/dialog';
    import { UntypedFormBuilder } from '@angular/forms';

    
    import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
    import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
    import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
    import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
    import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

    import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
    import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
    import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
    import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
    import { GroupRiskPolicyCaseModel } from '../../shared/entities/group-risk-policy-case-model';

    @Component({
    selector: 'app-group-risk-documents',
    templateUrl: './group-risk-documents.component.html',
    styleUrls: ['./group-risk-documents.component.css']
    })
    
    export class GroupRiskDocumentsComponent extends WizardDetailBaseComponent<GroupRiskPolicyCaseModel>{
        documentSet = DocumentSetEnum.GroupRisk;
        documentSystemName = DocumentSystemNameEnum.PolicyManager;
        forceRequiredDocumentTypeFilter: DocumentTypeEnum[] = [];
        errors: string[] = [];
        itemId = 1235;
        policyId: number = 1235;
        allRequiredDocumentsUploaded = false;
        wizardId: string;

        constructor(
            authService: AuthService,
            activatedRoute: ActivatedRoute,
            appEventsManager: AppEventsManager,
            private readonly formBuilder: UntypedFormBuilder ) {
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
    
        isRequiredDocumentsUploaded(isUploaded: boolean) {
            this.allRequiredDocumentsUploaded = isUploaded;
        }

        onValidateModel(validationResult: ValidationResult): ValidationResult {
            if (!this.allRequiredDocumentsUploaded) {
            validationResult.errors += 1;
            validationResult.errorMessages.push('All required documents must be uploaded');
            }
            return validationResult;
        }
    }
    


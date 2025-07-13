    import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
    import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';
    import { ActivatedRoute } from '@angular/router';
    import { MatDialog } from '@angular/material/dialog';
    import { BehaviorSubject } from 'rxjs';

    import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
    import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
    import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';

    import { ICD10CodeModel } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-model';
    import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service'
    import { ICD10CodeFilterDialogComponent } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-filter-dialog.component';
    import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';
    import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
    import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';

    import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
    import { BodySideAffectedTypeEnum } from 'projects/shared-models-lib/src/lib/enums/body-side-affected-type-enum';
    import { InjurySeverityTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/injury-severity-type-enum';

    @Component({
    selector: 'app-report-diagnosis',
    templateUrl: './report-diagnosis.component.html',
    styleUrls: ['./report-diagnosis.component.css']
    })
    export class ReportDiagnosisComponent implements OnInit {
    @Input() workItemMedicalReport: WorkItemMedicalReport;
    @Input() isReadOnly = false;

    @Output() isCompletedEmit: EventEmitter<boolean> = new EventEmitter();

    form: UntypedFormGroup;
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    minDate: Date;
    day = new Date().getDay().toString();
    year = (new Date().getFullYear() - 1).toString();
    isLoading = false;
    icd10Codes: ICD10CodeModel[];
    personEvent: any;
    documentSetType: DocumentSetEnum;
    isModernization: boolean;
    documentId: number;
    healthCareProviderId: number = 0;
    matchDescription: string;
    isAMatch: boolean;


    constructor(appEventsManager: AppEventsManager,
        authService: AuthService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly dialog: MatDialog,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly icd10CodeService: ICD10CodeService,
        private readonly medicalFormService: MedicalFormService,
        private readonly digiCareService: DigiCareService) { }


    ngOnInit() {
        this.activatedRoute.params.subscribe((params: any) => {
            if (params.healthCareProviderId) {
                this.healthCareProviderId = params.healthCareProviderId;
            }
        });

        this.icd10Codes = [];
        this.createForm();
    }

    ngOnChange(): void{
        if (this.workItemMedicalReport) {
        this.createForm();
        }
    }

    createForm(): void {
        if (this.form) { return; }
    
        this.form = this.formBuilder.group({  
        icd10Codes: [''],
        icd10CodesJson: ['']
        });

        if(this.workItemMedicalReport && this.workItemMedicalReport.medicalReport){
            this.setIcd10CodesValues();
        }

        this.CheckICD10CodeMatches();
    }

    CheckICD10CodeMatches(){
        
        if(this.workItemMedicalReport.medicalReport.icd10Codes){
            let codes = this.workItemMedicalReport.medicalReport.icd10Codes.replace(', ', '; ');
            let personEventId = this.workItemMedicalReport.medicalReport.personEventId; 
            this.icd10CodeService.CheckICD10CodeMatchInjurygrouping(codes, personEventId, this.healthCareProviderId).subscribe(
                (data: {icD10Code: string, isClinicalCode:boolean, isCauseCode:boolean, isValid:boolean, description: string}[]) => {
                    this.setICD10CodeMatches(data);
                });
        }
        else{
            if(this.icd10Codes && this.icd10Codes.length > 0){
                let codes = "";
                for (const ICD10Code of this.icd10Codes) {
                    codes = codes + (codes.length > 0 ? `; ${ICD10Code.icd10Code}` : ICD10Code.icd10Code);
                }

                let personEventId = this.workItemMedicalReport.medicalReport.personEventId; 
                this.icd10CodeService.CheckICD10CodeMatchInjurygrouping(codes, personEventId, this.healthCareProviderId).subscribe(
                    (data: {icD10Code: string, isClinicalCode:boolean, isCauseCode:boolean, isValid:boolean, description: string}[]) => {
                        this.setICD10CodeMatches(data);
                    });
            }
        }
    }

    setICD10CodeMatches(data: {icD10Code: string, isClinicalCode:boolean, isCauseCode:boolean, isValid:boolean, description: string}[]){
        if (data && data.length > 0) {
            let found = data.find(d => {return d.isValid === false});

            if(found) {   
                this.isAMatch = false;
                this.workItemMedicalReport.medicalReport.isICD10CodeMatch = false;
                this.matchDescription = "ICD10 code(s) do not matching with claim injury";
            }
            else{
                this.isAMatch = true;
                this.workItemMedicalReport.medicalReport.isICD10CodeMatch = true;
                this.matchDescription = "ICD10 code(s) matches";
            }
        }
    }

    setIcd10CodesValues(){
        if(this.workItemMedicalReport.medicalReport.icd10CodesJson){
            let icd10CodesJson:ICD10CodeModel[] = JSON.parse(this.workItemMedicalReport.medicalReport.icd10CodesJson);
            const icd10CodesArray = this.workItemMedicalReport.medicalReport.icd10Codes.replace(/\s/g, "").split(',');
            for( const code of icd10CodesArray){
                this.icd10CodeService.filterICD10Code(code).subscribe(ICD10CodeResult => {
                if ( !ICD10CodeResult ) return;
                for( const ICD10Code of ICD10CodeResult){
                    if(icd10CodesJson){
                    let simplified = icd10CodesJson.find(simplifiedCode => simplifiedCode.icd10Code.toLowerCase() === code.toLowerCase());
                    if(simplified){
                        ICD10Code.bodySideComment = simplified.bodySideComment;
                        ICD10Code.bodySideAffected = simplified.bodySideAffected;
                        ICD10Code.severity = simplified.severity;
                    }
                    }
                    this.icd10Codes.push(ICD10Code);
                } 
                }); 
            }
        } 
    }

    readForm() {
        if (!this.workItemMedicalReport.medicalReport) {
        this.workItemMedicalReport.medicalReport = new MedicalReportForm();
        }

        // Construct the list of select ICD10-codes into a string of the form 'S08.1, S09.2, etc..'

        let codes = "";
        let simplifiedCodes = [];
        for (const ICD10Code of this.icd10Codes) {
            codes = codes + (codes.length > 0 ? `, ${ICD10Code.icd10Code}` : ICD10Code.icd10Code);

            let simplifiedCode = new ICD10CodeModel();

            simplifiedCode.icd10Code = ICD10Code.icd10Code;
            simplifiedCode.bodySideComment = ICD10Code.bodySideComment;
            simplifiedCode.bodySideAffected = ICD10Code.bodySideAffected;
            simplifiedCode.severity = ICD10Code.severity;

            simplifiedCodes.push(simplifiedCode);
        }

        this.workItemMedicalReport.medicalReport.icd10Codes  = codes;
        this.form.patchValue({icd10Codes:codes});

        this.workItemMedicalReport.medicalReport.icd10CodesJson = JSON.stringify(simplifiedCodes);
    }

    save() {
        this.readForm();   
        this.isCompletedEmit.emit(true);
    }

    onItemRemoved(item:any):void{
        let i = 0; 
        for(; i < this.icd10Codes.length; i++) {
            if(item.icd10CodeId === this.icd10Codes[i].icd10CodeId){
                break;
            }
        }

        this.icd10Codes.splice(i,1);
        if(this.icd10Codes.length === 0){
            this.form.patchValue({icd10Codes:''});
            this.matchDescription = '';
        }
        else
        {
            this.CheckICD10CodeMatches();
        }
    }

    onShowDialogClick():void {
        let items : ICD10CodeModel[]; items = [];

        let dialogRef = this.dialog.open(ICD10CodeFilterDialogComponent, {
        height: '40%',
        width: '80%',
        panelClass: 'custom-dialog',
        data: { resultItems:items },
        });

        dialogRef.afterClosed().subscribe(result => {
            if ( !result ) return;

            for( const x of result.resultItems ) this.icd10Codes.push(x);

            this.CheckICD10CodeMatches();
        });
    }

    isNotSet(str): boolean {
        return (!str || 0 === str.length || str === undefined);
    }

    getBodySideAffectedType(id: number) {
        return this.format(BodySideAffectedTypeEnum[id]);
    }

    getInjurySeverityType(id: number) {
        return this.format(InjurySeverityTypeEnum[id]);
    }

    format(text: string) {
        const status = text.replace(/([A-Z])/g, '$1').trim();
        return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
    }
    
    isIcd10CodeSelected() : boolean{
        if(this.icd10Codes.length > 0)
            return true
        else
            false  
    }
    }

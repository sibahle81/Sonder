import { MedicalReportForm } from "projects/digicare/src/app/medical-form-manager/models/medical-report-form";
import { WorkItem } from "projects/digicare/src/app/work-manager/models/work-item";
import { ReportCategoryDetail } from 'projects/medicare/src/app/medical-reports-manager/models/report-category';


export class WorkItemMedicalReport{
    workItem: WorkItem;
    medicalReport: MedicalReportForm;
    reportType: any;
    reportCategory: any;
    }

    
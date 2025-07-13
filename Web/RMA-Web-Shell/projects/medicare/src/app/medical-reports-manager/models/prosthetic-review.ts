import { ReportCategoryDetail } from 'projects/medicare/src/app/medical-reports-manager/models/report-category';

export class ProstheticReviewDetail extends ReportCategoryDetail
{
    preAuthNumber: string;
    prostheticItem: string;
    prostheticServiceType: string;
    remark: string;
    dateLastProthesisIssued: Date;
    amputationLevel: string;
    amputationSide: string;
    prostheticActivityLevel: string;
    stumpDistalCircumference: number;
    stumpProximalCircumference: number;
    prostheticDescription: string;
    prostheticSerialNo: string;
    footSize: number;
    stumpSocks: boolean;
    suspensionOption: string;
    other: string;
    prosthesisReviewComments: string;
    prothesisReviewDate: Date;
    orthotist: string;
    reviewedBy: string;
}
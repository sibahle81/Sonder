import { DiseaseTypeEnum } from "../../enums/disease-type-enum";

export class PersonEventDiseaseDetailModel {
    personEventId: number;
    natureOfDisease: string;
    typeOfDisease: DiseaseTypeEnum;
    causeOfDiseaseId: number;
    dateDiagnosis: Date;
}

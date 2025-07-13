import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class PersonEventQuestionnaire extends BaseClass {
    personEventId: number;
    isTrainee: boolean;
    traineeLocation: string;
    averageEarnings: number;
    basicRate: number;
    annualBonus: number;
    subTotal: number;
    subTotalSecond: number;
    employeeNumber: string;
    employeeLocation: string;
    employeeAverageEarnings: number;
    employeeBasicRate: number;
    employeeAnnualBonus: number;
    firstHousingQuarters: number;
    secondAverageEarnings: number;
    secondBasicRate: number;
    secondAnnualBonus: number;
    secondHousingQuarters: number;
    secondEmployeeNumber: string;

}

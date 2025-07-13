import { GenderEnum } from 'projects/shared-models-lib/src/lib/enums/gender-enum';
import { MaritalStatusEnum } from 'projects/shared-models-lib/src/lib/enums/marital-status-enum';
import { NationalityEnum } from 'projects/shared-models-lib/src/lib/enums/nationality-enum';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { TitleEnum } from 'projects/shared-models-lib/src/lib/enums/title-enum';
import { IdTypeEnum } from '../enums/idTypeEnum';

export class EmployeeOtherInsuredlifeModel {
    employeeRolePlayerId: number; /// toRolePlayerId in relation roleplayer table
    otherInsureLifeRolePlayerId: number;  /// fromRolePlayerId in relation roleplayer table
    relationship: RolePlayerTypeEnum;  /// rolePlayerType (Spouse, Child, Niece, Nephew, Mother, Father and other)

    /// otherInsureLife Roleplayer details

    effectiveDate: Date;
    title: TitleEnum | null;
    initials: string;
    name: string;
    surname: string;
    idNumber: string;
    dateOfBirth: Date;
    taxNumber: string;
    employeeJoinDate: Date | null;
    gender: GenderEnum;
    maritalStatus: MaritalStatusEnum;
    idType: IdTypeEnum;
    nationality: NationalityEnum;
}
CREATE TABLE [medical].[HealthCareProvider] (
    [RolePlayerId]                   INT             NOT NULL,
    [Name]                           VARCHAR (80)    NOT NULL,
    [Description]                    NVARCHAR (2048) NULL,
    [PracticeNumber]                 VARCHAR (50)    NOT NULL,
    [DatePracticeStarted]            DATETIME        NULL,
    [DatePracticeClosed]             DATETIME        NULL,
    [ProviderTypeId]                 INT             NOT NULL,
    [IsVat]                          BIT             NOT NULL,
    [VATRegNumber]                   VARCHAR (50)    NULL,
    [ConsultingPartnerType]          INT             NULL,
    [IsPreferred]                    BIT             NOT NULL,
    [IsMedInvTreatmentInfoProvided]  BIT             NOT NULL,
    [IsMedInvInjuryInfoProvided]     BIT             NOT NULL,
    [IsMineHospital]                 BIT             NOT NULL,
    [IsNeedTreatments]               BIT             NOT NULL,
    [ArmType]                        INT             NULL,
    [ArmCode]                        VARCHAR (12)    NULL,
    [FinSystemSynchStatusId]         INT             NOT NULL,
    [HealthCareProviderGroupId]      INT             NOT NULL,
    [DispensingLicenseNo]            VARCHAR (50)    NULL,
    [AcuteMedicalAuthNeededTypeId]   INT             NULL,
    [ChronicMedicalAuthNeededTypeId] INT             NULL,
    [IsAllowSameDayTreatment]        BIT             NOT NULL,
    [AgreementEndDate]               DATETIME        NULL,
    [AgreementStartDate]             DATETIME        NULL,
    [IsAuthorised]                   BIT             NULL,
    [AgreementType]                  TINYINT         NULL,
    [IsActive]                       BIT             NOT NULL,
    [IsDeleted]                      BIT             NOT NULL,
    [CreatedBy]                      VARCHAR (50)    NOT NULL,
    [CreatedDate]                    DATETIME        NOT NULL,
    [ModifiedBy]                     VARCHAR (50)    NOT NULL,
    [ModifiedDate]                   DATETIME        NOT NULL,
    [Hash]                           VARCHAR (66)    NULL,
    [IsExcludeAutoPay]               BIT             DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_Medical_HealthCareProvider] PRIMARY KEY CLUSTERED ([RolePlayerId] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_RolePlayer_HealthCareProvider] FOREIGN KEY ([RolePlayerId]) REFERENCES [client].[RolePlayer] ([RolePlayerId])
);










GO
CREATE NONCLUSTERED INDEX [IX_PracticeNumber]
    ON [medical].[HealthCareProvider]([PracticeNumber] ASC);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'VATRegNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'VATRegNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'VATRegNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'VATRegNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'VATRegNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'VATRegNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ProviderTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ProviderTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ProviderTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ProviderTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ProviderTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ProviderTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'PracticeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'PracticeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'PracticeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'PracticeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'PracticeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'PracticeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsVat';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsVat';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsVat';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsVat';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsVat';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsVat';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsNeedTreatments';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsNeedTreatments';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsNeedTreatments';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsNeedTreatments';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsNeedTreatments';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsNeedTreatments';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMineHospital';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMineHospital';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMineHospital';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMineHospital';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMineHospital';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMineHospital';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvTreatmentInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvTreatmentInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvTreatmentInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvTreatmentInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvTreatmentInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvTreatmentInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvInjuryInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvInjuryInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvInjuryInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvInjuryInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvInjuryInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvInjuryInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsAuthorised';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsAuthorised';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsAuthorised';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsAuthorised';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsAuthorised';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsAuthorised';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsAllowSameDayTreatment';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsAllowSameDayTreatment';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsAllowSameDayTreatment';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsAllowSameDayTreatment';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsAllowSameDayTreatment';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsAllowSameDayTreatment';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'HealthCareProviderGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'HealthCareProviderGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'HealthCareProviderGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'HealthCareProviderGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'HealthCareProviderGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'HealthCareProviderGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Hash';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Hash';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Hash';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Hash';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Hash';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Hash';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'FinSystemSynchStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'FinSystemSynchStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'FinSystemSynchStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'FinSystemSynchStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'FinSystemSynchStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'FinSystemSynchStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DispensingLicenseNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DispensingLicenseNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DispensingLicenseNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DispensingLicenseNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DispensingLicenseNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DispensingLicenseNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeStarted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeStarted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeStarted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeStarted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeStarted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeStarted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeClosed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeClosed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeClosed';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeClosed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeClosed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeClosed';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ConsultingPartnerType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ConsultingPartnerType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ConsultingPartnerType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ConsultingPartnerType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ConsultingPartnerType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ConsultingPartnerType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ChronicMedicalAuthNeededTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ChronicMedicalAuthNeededTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ChronicMedicalAuthNeededTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ChronicMedicalAuthNeededTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ChronicMedicalAuthNeededTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ChronicMedicalAuthNeededTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ArmType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ArmType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ArmType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ArmType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ArmType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ArmType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ArmCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ArmCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ArmCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ArmCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ArmCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'ArmCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AgreementEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AcuteMedicalAuthNeededTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AcuteMedicalAuthNeededTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AcuteMedicalAuthNeededTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AcuteMedicalAuthNeededTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AcuteMedicalAuthNeededTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'HealthCareProvider', @level2type = N'COLUMN', @level2name = N'AcuteMedicalAuthNeededTypeId';


GO
CREATE NONCLUSTERED INDEX [IX_HealthCareProvider_ProviderTypeId_IsDeleted]
    ON [medical].[HealthCareProvider]([ProviderTypeId] ASC, [IsDeleted] ASC)
    INCLUDE([Name], [Description], [PracticeNumber], [DatePracticeStarted], [DatePracticeClosed], [IsVat], [VATRegNumber], [ConsultingPartnerType], [IsPreferred], [IsMedInvTreatmentInfoProvided], [IsMedInvInjuryInfoProvided], [IsMineHospital], [IsNeedTreatments], [ArmType], [ArmCode], [FinSystemSynchStatusId], [HealthCareProviderGroupId], [DispensingLicenseNo], [AcuteMedicalAuthNeededTypeId], [ChronicMedicalAuthNeededTypeId], [IsAllowSameDayTreatment], [AgreementEndDate], [AgreementStartDate], [IsAuthorised], [AgreementType]);


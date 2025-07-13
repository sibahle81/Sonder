CREATE TABLE [client].[MedicalServiceProvider] (
    [RolePlayerId]                      INT           NOT NULL,
    [Name]                              VARCHAR (255) NOT NULL,
    [Description]                       VARCHAR (255) NULL,
    [PracticeNo]                        VARCHAR (50)  NOT NULL,
    [DatePracticeStarted]               DATE          NOT NULL,
    [DatePracticeClosed]                DATE          NULL,
    [PractitionerTypeId]                INT           NOT NULL,
    [VatRegistrationNo]                 VARCHAR (50)  NULL,
    [ConsultingPartnerTypeId]           INT           NULL,
    [PracticeDiscipline]                VARCHAR (50)  NULL,
    [PracticeSubDiscipline]             VARCHAR (50)  NULL,
    [ProviderDiscipline]                VARCHAR (50)  NULL,
    [ProviderSubDiscipline]             VARCHAR (50)  NULL,
    [IsPreferred]                       BIT           NOT NULL,
    [IsMedInvoiceTreatmentInfoProvided] BIT           NOT NULL,
    [IsMedInvoiceInjuryInfoProvided]    BIT           NOT NULL,
    [DispensingLicenseNo]               VARCHAR (50)  NULL,
    [AllowSameDayTreatment]             BIT           NOT NULL,
    [IsAuthorised]                      BIT           NOT NULL,
    [IsDeleted]                         BIT           NOT NULL,
    [CreatedBy]                         VARCHAR (50)  NOT NULL,
    [CreatedDate]                       DATETIME      NOT NULL,
    [ModifiedBy]                        VARCHAR (50)  NOT NULL,
    [ModifiedDate]                      DATETIME      NOT NULL,
    CONSTRAINT [PK__MedicalS__3214EC0767EFDD19] PRIMARY KEY CLUSTERED ([RolePlayerId] ASC),
    CONSTRAINT [FK_MedicalServiceProvider_PractitionerType] FOREIGN KEY ([PractitionerTypeId]) REFERENCES [common].[PractitionerType] ([Id]),
    CONSTRAINT [FK_MedicalServiceProvider_RolePlayer] FOREIGN KEY ([RolePlayerId]) REFERENCES [client].[RolePlayer] ([RolePlayerId])
);


GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'VatRegistrationNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'VatRegistrationNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'VatRegistrationNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'VatRegistrationNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'VatRegistrationNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'VatRegistrationNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ProviderSubDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ProviderSubDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ProviderSubDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ProviderSubDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ProviderSubDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ProviderSubDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ProviderDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ProviderDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ProviderDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ProviderDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ProviderDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ProviderDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PractitionerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PractitionerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PractitionerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PractitionerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PractitionerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PractitionerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeSubDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeSubDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeSubDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeSubDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeSubDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeSubDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'PracticeDiscipline';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvoiceTreatmentInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvoiceTreatmentInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvoiceTreatmentInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvoiceTreatmentInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvoiceTreatmentInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvoiceTreatmentInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvoiceInjuryInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvoiceInjuryInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvoiceInjuryInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvoiceInjuryInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvoiceInjuryInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsMedInvoiceInjuryInfoProvided';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsAuthorised';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsAuthorised';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsAuthorised';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsAuthorised';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsAuthorised';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'IsAuthorised';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DispensingLicenseNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DispensingLicenseNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DispensingLicenseNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DispensingLicenseNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DispensingLicenseNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DispensingLicenseNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeStarted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeStarted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeStarted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeStarted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeStarted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeStarted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeClosed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeClosed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeClosed';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeClosed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeClosed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'DatePracticeClosed';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ConsultingPartnerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ConsultingPartnerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ConsultingPartnerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ConsultingPartnerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ConsultingPartnerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'ConsultingPartnerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'AllowSameDayTreatment';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'AllowSameDayTreatment';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'AllowSameDayTreatment';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'AllowSameDayTreatment';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'AllowSameDayTreatment';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'MedicalServiceProvider', @level2type = N'COLUMN', @level2name = N'AllowSameDayTreatment';


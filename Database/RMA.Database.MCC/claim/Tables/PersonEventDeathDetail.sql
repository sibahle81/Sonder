CREATE TABLE [claim].[PersonEventDeathDetail] (
    [PersonEventId]                INT                                                NOT NULL,
    [DeathTypeId]                  INT                                                NOT NULL,
    [Causeofdeath]                 INT MASKED WITH (FUNCTION = 'default()')           NULL,
    [DHAReferenceNo]               VARCHAR (100) MASKED WITH (FUNCTION = 'default()') NULL,
    [DeathCertificateNo]           VARCHAR (100) MASKED WITH (FUNCTION = 'default()') NULL,
    [InterviewWithFamilyMember]    BIT                                                NULL,
    [OpinionOfMedicalPractitioner] BIT                                                NULL,
    [DeathDate]                    DATETIME MASKED WITH (FUNCTION = 'default()')      NOT NULL,
    [HomeAffairsRegion]            VARCHAR (100)                                      NULL,
    [PlaceOfDeath]                 VARCHAR (100) MASKED WITH (FUNCTION = 'default()') NULL,
    [DateOfPostMortem]             VARCHAR (50)                                       NULL,
    [PostMortemNumber]             VARCHAR (50) MASKED WITH (FUNCTION = 'default()')  NULL,
    [BodyNumber]                   VARCHAR (50)                                       NULL,
    [SAPCaseNumber]                VARCHAR (50) MASKED WITH (FUNCTION = 'default()')  NULL,
    [BodyCollectionDate]           DATETIME                                           NULL,
    [BodyCollectorId]              INT                                                NULL,
    [UnderTakerId]                 INT                                                NULL,
    [FuneralParlorId]              INT                                                NULL,
    [DoctorId]                     INT                                                NULL,
    [ForensicPathologistId]        INT                                                NULL,
    [CauseOfDeathDescription]      VARCHAR (250)                                      NULL,
    CONSTRAINT [PK_PersonEventDeathDetail] PRIMARY KEY CLUSTERED ([PersonEventId] ASC),
    CONSTRAINT [FK_PersonEventDeathDetail_CauseOfDeathType] FOREIGN KEY ([DeathTypeId]) REFERENCES [common].[CauseOfDeathType] ([Id]),
    CONSTRAINT [FK_PersonEventDeathDetail_PersonEvent] FOREIGN KEY ([PersonEventId]) REFERENCES [claim].[PersonEvent] ([PersonEventId])
);




GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'UnderTakerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'UnderTakerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'UnderTakerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'UnderTakerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'UnderTakerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'UnderTakerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'SAPCaseNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'SAPCaseNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'SAPCaseNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'SAPCaseNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'SAPCaseNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'SAPCaseNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PostMortemNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PostMortemNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PostMortemNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PostMortemNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PostMortemNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PostMortemNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PlaceOfDeath';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PlaceOfDeath';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PlaceOfDeath';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PlaceOfDeath';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PlaceOfDeath';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PlaceOfDeath';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'OpinionOfMedicalPractitioner';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'OpinionOfMedicalPractitioner';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'OpinionOfMedicalPractitioner';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'OpinionOfMedicalPractitioner';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'OpinionOfMedicalPractitioner';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'OpinionOfMedicalPractitioner';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'InterviewWithFamilyMember';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'InterviewWithFamilyMember';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'InterviewWithFamilyMember';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'InterviewWithFamilyMember';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'InterviewWithFamilyMember';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'InterviewWithFamilyMember';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'HomeAffairsRegion';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'HomeAffairsRegion';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'HomeAffairsRegion';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'HomeAffairsRegion';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'HomeAffairsRegion';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'HomeAffairsRegion';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'FuneralParlorId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'FuneralParlorId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'FuneralParlorId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'FuneralParlorId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'FuneralParlorId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'FuneralParlorId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'ForensicPathologistId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'ForensicPathologistId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'ForensicPathologistId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'ForensicPathologistId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'ForensicPathologistId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'ForensicPathologistId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DoctorId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DoctorId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DoctorId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DoctorId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DoctorId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DoctorId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DHAReferenceNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DHAReferenceNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DHAReferenceNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DHAReferenceNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DHAReferenceNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DHAReferenceNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathCertificateNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathCertificateNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathCertificateNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathCertificateNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathCertificateNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DeathCertificateNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DateOfPostMortem';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DateOfPostMortem';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DateOfPostMortem';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DateOfPostMortem';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DateOfPostMortem';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'DateOfPostMortem';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'CauseOfDeathDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'CauseOfDeathDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'CauseOfDeathDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'CauseOfDeathDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'CauseOfDeathDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'CauseOfDeathDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'Causeofdeath';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'Causeofdeath';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'Causeofdeath';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'Causeofdeath';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'Causeofdeath';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'Causeofdeath';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyCollectorId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyCollectorId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyCollectorId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyCollectorId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyCollectorId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyCollectorId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyCollectionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyCollectionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyCollectionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyCollectionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyCollectionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventDeathDetail', @level2type = N'COLUMN', @level2name = N'BodyCollectionDate';


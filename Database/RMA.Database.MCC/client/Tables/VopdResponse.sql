CREATE TABLE [client].[VopdResponse] (
    [VopdResponseId]  INT                                               IDENTITY (1, 1) NOT NULL,
    [RolePlayerId]    INT                                               NOT NULL,
    [VopdStatusId]    INT                                               NOT NULL,
    [Reason]          VARCHAR (255)                                     NULL,
    [Identity]        BIT MASKED WITH (FUNCTION = 'default()')          NULL,
    [MaritalStatus]   BIT                                               NULL,
    [Death]           BIT MASKED WITH (FUNCTION = 'default()')          NULL,
    [DateVerified]    DATE                                              NULL,
    [IdNumber]        VARCHAR (13) MASKED WITH (FUNCTION = 'default()') NULL,
    [Surname]         VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [DeceasedStatus]  VARCHAR (50)                                      NULL,
    [DateOfDeath]     VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [Firstname]       VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [SubmittedDate]   DATETIME                                          NULL,
    [ResubmittedDate] DATETIME                                          NULL,
    [OverrideCount]   INT                                               DEFAULT ((0)) NULL,
    CONSTRAINT [PK_VopdResponse] PRIMARY KEY CLUSTERED ([VopdResponseId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_VopdStatus_VopdResponse] FOREIGN KEY ([VopdStatusId]) REFERENCES [common].[VopdStatus] ([Id])
);








GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'VopdStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'VopdStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'VopdStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'VopdStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'VopdStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'VopdStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'VopdResponseId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'VopdResponseId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'VopdResponseId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'VopdResponseId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'VopdResponseId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'VopdResponseId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'SubmittedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'SubmittedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'SubmittedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'SubmittedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'SubmittedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'SubmittedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'ResubmittedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'ResubmittedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'ResubmittedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'ResubmittedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'ResubmittedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'ResubmittedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'MaritalStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'MaritalStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'MaritalStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'MaritalStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'MaritalStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'MaritalStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Identity';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Identity';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Identity';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Identity';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Identity';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Identity';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Firstname';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Firstname';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Firstname';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Firstname';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Firstname';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Firstname';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DeceasedStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DeceasedStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DeceasedStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DeceasedStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DeceasedStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DeceasedStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Death';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Death';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Death';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Death';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Death';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'Death';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DateVerified';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DateVerified';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DateVerified';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DateVerified';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DateVerified';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DateVerified';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DateOfDeath';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DateOfDeath';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DateOfDeath';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DateOfDeath';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DateOfDeath';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'VopdResponse', @level2type = N'COLUMN', @level2name = N'DateOfDeath';


GO
CREATE NONCLUSTERED INDEX [IX_VopdResponse_RolePlayerId_Reason]
    ON [client].[VopdResponse]([RolePlayerId] ASC, [Reason] ASC)
    INCLUDE([VopdStatusId], [Surname], [DeceasedStatus]);


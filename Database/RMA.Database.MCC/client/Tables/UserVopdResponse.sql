CREATE TABLE [client].[UserVopdResponse] (
    [UserVopdResponseId] INT                                               IDENTITY (1, 1) NOT NULL,
    [VopdStatusId]       INT                                               NOT NULL,
    [Reason]             VARCHAR (255)                                     NULL,
    [Identity]           BIT MASKED WITH (FUNCTION = 'default()')          NULL,
    [MaritalStatus]      BIT                                               NULL,
    [Death]              BIT MASKED WITH (FUNCTION = 'default()')          NULL,
    [DateVerified]       DATE                                              NULL,
    [IdNumber]           VARCHAR (13) MASKED WITH (FUNCTION = 'default()') NULL,
    [IsProcessed]        BIT                                               DEFAULT ((0)) NULL,
    CONSTRAINT [PK_UserVopdResponse] PRIMARY KEY CLUSTERED ([UserVopdResponseId] ASC),
    CONSTRAINT [FK_VopdStatus_UserVopdResponse] FOREIGN KEY ([VopdStatusId]) REFERENCES [common].[VopdStatus] ([Id])
);


GO


GO


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'VopdStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'VopdStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'VopdStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'VopdStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'VopdStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'VopdStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'UserVopdResponseId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'UserVopdResponseId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'UserVopdResponseId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'UserVopdResponseId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'UserVopdResponseId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'UserVopdResponseId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'MaritalStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'MaritalStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'MaritalStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'MaritalStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'MaritalStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'MaritalStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Identity';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Identity';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Identity';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Identity';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Identity';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Identity';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Death';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Death';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Death';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Death';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Death';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'Death';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'DateVerified';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'DateVerified';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'DateVerified';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'DateVerified';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'DateVerified';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'UserVopdResponse', @level2type = N'COLUMN', @level2name = N'DateVerified';


CREATE TABLE [rules].[Audit] (
    [Id]             INT              IDENTITY (1, 1) NOT NULL,
    [RequestId]      UNIQUEIDENTIFIER NOT NULL,
    [Request]        VARCHAR (MAX)    NOT NULL,
    [Response]       VARCHAR (MAX)    NOT NULL,
    [OverallSuccess] BIT              NOT NULL,
    [RequestedBy]    VARCHAR (50)     NOT NULL,
    [Timestamp]      DATETIME         NOT NULL,
    CONSTRAINT [PK_Audit] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Timestamp';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Timestamp';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Timestamp';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Timestamp';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Timestamp';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Timestamp';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Response';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Response';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Response';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Response';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Response';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Response';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'RequestId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'RequestId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'RequestId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'RequestId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'RequestId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'RequestId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'RequestedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'RequestedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'RequestedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'RequestedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'RequestedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'RequestedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Request';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Request';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Request';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Request';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Request';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Request';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'OverallSuccess';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'OverallSuccess';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'OverallSuccess';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'OverallSuccess';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'OverallSuccess';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'OverallSuccess';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Audit', @level2type = N'COLUMN', @level2name = N'Id';


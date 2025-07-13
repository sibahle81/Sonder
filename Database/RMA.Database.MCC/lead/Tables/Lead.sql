CREATE TABLE [lead].[Lead] (
    [LeadId]             INT                                                IDENTITY (1, 1) NOT NULL,
    [Code]               VARCHAR (20)                                       NOT NULL,
    [ClientTypeId]       INT                                                NOT NULL,
    [RolePlayerId]       INT                                                NULL,
    [DisplayName]        VARCHAR (255) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [ReceivedDate]       DATETIME                                           NOT NULL,
    [LeadClientStatusId] INT                                                NOT NULL,
    [LeadSourceId]       INT                                                NOT NULL,
    [IsDeleted]          BIT                                                CONSTRAINT [DF_Lead_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]          VARCHAR (50)                                       NOT NULL,
    [CreatedDate]        DATETIME                                           CONSTRAINT [DF_Lead_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]         VARCHAR (50)                                       NOT NULL,
    [ModifiedDate]       DATETIME                                           CONSTRAINT [DF_Lead_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    [DeclineReason]      VARCHAR (255)                                      NULL,
    CONSTRAINT [PK_LeadId] PRIMARY KEY CLUSTERED ([LeadId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_ClientTypeLead_ClientTypeId] FOREIGN KEY ([ClientTypeId]) REFERENCES [common].[ClientType] ([Id]),
    CONSTRAINT [FK_Lead_LeadClientStatus] FOREIGN KEY ([LeadClientStatusId]) REFERENCES [common].[LeadClientStatus] ([Id]),
    CONSTRAINT [FK_Lead_LeadSource] FOREIGN KEY ([LeadSourceId]) REFERENCES [common].[LeadSource] ([Id])
);








GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO
CREATE UNIQUE NONCLUSTERED INDEX [IDX_RolePlayerId]
    ON [lead].[Lead]([RolePlayerId] ASC) WHERE ([RolePlayerId] IS NOT NULL);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ReceivedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ReceivedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ReceivedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ReceivedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ReceivedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ReceivedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadSourceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadSourceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadSourceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadSourceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadSourceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadSourceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadClientStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadClientStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadClientStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadClientStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadClientStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'LeadClientStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'DisplayName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'DisplayName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'DisplayName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'DisplayName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'DisplayName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'DisplayName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ClientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ClientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ClientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ClientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ClientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Lead', @level2type = N'COLUMN', @level2name = N'ClientTypeId';


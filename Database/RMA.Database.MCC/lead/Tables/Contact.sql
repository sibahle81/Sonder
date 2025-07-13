CREATE TABLE [lead].[Contact] (
    [ContactId]              INT                                                IDENTITY (1, 1) NOT NULL,
    [LeadId]                 INT                                                NOT NULL,
    [Name]                   VARCHAR (150) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [CommunicationTypeId]    INT                                                NOT NULL,
    [CommunicationTypeValue] VARCHAR (50)                                       NOT NULL,
    [IsPreferred]            BIT                                                CONSTRAINT [DF_Contact_IsPreffered] DEFAULT ((0)) NOT NULL,
    [IsDeleted]              BIT                                                CONSTRAINT [DF_Contact_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]              VARCHAR (50)                                       NOT NULL,
    [CreatedDate]            DATETIME                                           CONSTRAINT [DF_Contact_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]             VARCHAR (50)                                       NOT NULL,
    [ModifiedDate]           DATETIME                                           CONSTRAINT [DF_Contact_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_ContactId] PRIMARY KEY CLUSTERED ([ContactId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Contact_CommunicationType] FOREIGN KEY ([CommunicationTypeId]) REFERENCES [common].[CommunicationType] ([Id]),
    CONSTRAINT [FK_Lead_Contact_LeadId] FOREIGN KEY ([LeadId]) REFERENCES [lead].[Lead] ([LeadId])
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
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'IsPreferred';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ContactId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ContactId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ContactId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ContactId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ContactId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'ContactId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CommunicationTypeValue';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CommunicationTypeValue';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CommunicationTypeValue';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CommunicationTypeValue';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CommunicationTypeValue';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CommunicationTypeValue';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CommunicationTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CommunicationTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CommunicationTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CommunicationTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CommunicationTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Contact', @level2type = N'COLUMN', @level2name = N'CommunicationTypeId';


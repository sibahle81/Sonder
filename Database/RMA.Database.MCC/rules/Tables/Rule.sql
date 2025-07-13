CREATE TABLE [rules].[Rule] (
    [Id]                    INT           IDENTITY (1, 1) NOT NULL,
    [RuleTypeId]            INT           NOT NULL,
    [Code]                  VARCHAR (10)  NOT NULL,
    [Name]                  VARCHAR (255) NOT NULL,
    [Description]           VARCHAR (500) NOT NULL,
    [ExecutionFilter]       VARCHAR (255) DEFAULT ('None') NOT NULL,
    [IsConfigurable]        BIT           DEFAULT ((0)) NOT NULL,
    [ConfigurationMetaData] VARCHAR (MAX) DEFAULT ('[]') NOT NULL,
    [IsActive]              BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]             BIT           DEFAULT ((0)) NOT NULL,
    [CreatedBy]             VARCHAR (50)  NOT NULL,
    [CreatedDate]           DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]            VARCHAR (50)  NOT NULL,
    [ModifiedDate]          DATETIME      DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_RuleId] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Rule_RuleType] FOREIGN KEY ([RuleTypeId]) REFERENCES [common].[RuleType] ([Id]),
    CONSTRAINT [AK_Name_Unique] UNIQUE NONCLUSTERED ([Name] ASC)
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
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'RuleTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'RuleTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'RuleTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'RuleTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'RuleTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'RuleTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsConfigurable';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsConfigurable';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsConfigurable';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsConfigurable';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsConfigurable';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsConfigurable';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ExecutionFilter';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ExecutionFilter';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ExecutionFilter';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ExecutionFilter';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ExecutionFilter';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ExecutionFilter';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ConfigurationMetaData';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ConfigurationMetaData';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ConfigurationMetaData';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ConfigurationMetaData';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ConfigurationMetaData';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'ConfigurationMetaData';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'rules', @level1type = N'TABLE', @level1name = N'Rule', @level2type = N'COLUMN', @level2name = N'Code';


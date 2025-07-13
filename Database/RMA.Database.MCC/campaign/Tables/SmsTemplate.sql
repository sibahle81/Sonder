CREATE TABLE [campaign].[SmsTemplate] (
    [Id]             INT           IDENTITY (1, 1) NOT NULL,
    [TemplateTypeId] INT           NULL,
    [Name]           VARCHAR (250) NOT NULL,
    [Template]       VARCHAR (165) NOT NULL,
    [IsActive]       BIT           CONSTRAINT [DF__SmsTempla__IsAct__08411774] DEFAULT ((1)) NOT NULL,
    [IsDeleted]      BIT           CONSTRAINT [DF__SmsTempla__IsDel__09353BAD] DEFAULT ((0)) NOT NULL,
    [CreatedBy]      VARCHAR (50)  NOT NULL,
    [CreatedDate]    DATETIME      CONSTRAINT [DF__SmsTempla__Creat__0A295FE6] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]     VARCHAR (50)  NOT NULL,
    [ModifiedDate]   DATETIME      CONSTRAINT [DF__SmsTempla__Modif__0B1D841F] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_SmsTemplate_id] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_SmsTemplate_TemplateType] FOREIGN KEY ([TemplateTypeId]) REFERENCES [common].[TemplateType] ([Id])
);


GO

GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'TemplateTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'TemplateTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'TemplateTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'TemplateTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'TemplateTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'TemplateTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Template';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Template';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Template';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Template';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Template';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Template';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsTemplate', @level2type = N'COLUMN', @level2name = N'CreatedBy';


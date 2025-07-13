CREATE TABLE [campaign].[TargetAudienceMember] (
    [Id]               INT                                                IDENTITY (1, 1) NOT NULL,
    [TargetAudienceId] INT                                                NOT NULL,
    [Name]             VARCHAR (50)                                       NOT NULL,
    [ContactName]      VARCHAR (100) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [Email]            VARCHAR (50) MASKED WITH (FUNCTION = 'default()')  NULL,
    [MobileNo]         VARCHAR (20)                                       NULL,
    [PhoneNo]          VARCHAR (20) MASKED WITH (FUNCTION = 'default()')  NULL,
    [Status]           VARCHAR (20)                                       DEFAULT ('New') NOT NULL,
    [IsActive]         BIT                                                DEFAULT ((1)) NOT NULL,
    [IsDeleted]        BIT                                                DEFAULT ((0)) NOT NULL,
    [CreatedBy]        VARCHAR (50)                                       NOT NULL,
    [CreatedDate]      DATETIME                                           DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]       VARCHAR (50)                                       NOT NULL,
    [ModifiedDate]     DATETIME                                           DEFAULT (getdate()) NOT NULL,
    [PolicyId]         INT                                                NULL,
    CONSTRAINT [PK_TargetAudienceMember_Id] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TargetAudienceMember_TargetAudience] FOREIGN KEY ([TargetAudienceId]) REFERENCES [campaign].[TargetAudience] ([Id])
);


GO

GO

GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'TargetAudienceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'TargetAudienceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'TargetAudienceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'TargetAudienceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'TargetAudienceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'TargetAudienceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'PhoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'PhoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'PhoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'PhoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'RML', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'PhoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CEO', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'PhoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'MobileNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'MobileNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'MobileNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'MobileNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'MobileNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'MobileNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'RML', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CEO', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ContactName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ContactName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ContactName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ContactName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'RML', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ContactName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CEO', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'TargetAudienceMember', @level2type = N'COLUMN', @level2name = N'ContactName';


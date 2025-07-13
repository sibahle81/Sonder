CREATE TABLE [campaign].[Campaign] (
    [Id]                 INT           IDENTITY (1, 1) NOT NULL,
    [TenantId]           INT           NOT NULL,
    [Name]               VARCHAR (100) NOT NULL,
    [Description]        VARCHAR (255) NULL,
    [CampaignCategoryId] INT           NOT NULL,
    [CampaignTypeId]     INT           NOT NULL,
    [ProductId]          INT           NULL,
    [CampaignStatusId]   INT           DEFAULT ((1)) NOT NULL,
    [Owner]              VARCHAR (50)  NULL,
    [Role]               VARCHAR (50)  NULL,
    [StartDate]          DATE          NULL,
    [EndDate]            DATE          NULL,
    [Paused]             BIT           DEFAULT ((0)) NOT NULL,
    [IsActive]           BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]          BIT           DEFAULT ((0)) NOT NULL,
    [CreatedBy]          VARCHAR (50)  NOT NULL,
    [CreatedDate]        DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]         VARCHAR (50)  NOT NULL,
    [ModifiedDate]       DATETIME      DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_Campaign_Id] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Campaign_CampaignCategory] FOREIGN KEY ([CampaignCategoryId]) REFERENCES [common].[CampaignCategory] ([Id]),
    CONSTRAINT [FK_Campaign_CampaignStatus] FOREIGN KEY ([CampaignStatusId]) REFERENCES [common].[CampaignStatus] ([Id]),
    CONSTRAINT [FK_Campaign_CampaignType] FOREIGN KEY ([CampaignTypeId]) REFERENCES [common].[CampaignType] ([Id]),
    CONSTRAINT [FK_Campaign_Product] FOREIGN KEY ([ProductId]) REFERENCES [product].[Product] ([Id]),
    CONSTRAINT [FK_Campaign_Tenant] FOREIGN KEY ([TenantId]) REFERENCES [security].[Tenant] ([Id])
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

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Role';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Role';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Role';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Role';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Role';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Role';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Paused';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Paused';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Paused';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Paused';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Paused';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Paused';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Owner';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Owner';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Owner';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Owner';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Owner';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Owner';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'Campaign', @level2type = N'COLUMN', @level2name = N'CampaignCategoryId';


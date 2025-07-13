CREATE TABLE [quote].[Quote] (
    [QuoteId]              INT             IDENTITY (1, 1) NOT NULL,
    [QuoteNumber]          VARCHAR (50)    NOT NULL,
    [QuoteStatusId]        INT             NOT NULL,
    [TenantId]             INT             CONSTRAINT [DF_Quote_TenantId] DEFAULT ((1)) NOT NULL,
    [DeclineReason]        VARCHAR (255)   NULL,
    [ParentQuoteId]        INT             NULL,
    [Rate]                 DECIMAL (18, 4) NULL,
    [CategoryInsuredId]    INT             NULL,
    [AverageEmployeeCount] INT             NULL,
    [AverageEarnings]      DECIMAL (18, 2) NULL,
    [Premium]              DECIMAL (18, 2) NULL,
    [IsDeleted]            BIT             CONSTRAINT [DF_Quote_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]            VARCHAR (50)    NOT NULL,
    [CreatedDate]          DATETIME        CONSTRAINT [DF_Quote_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]           VARCHAR (50)    NOT NULL,
    [ModifiedDate]         DATETIME        CONSTRAINT [DF_Quote_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_QuoteId] PRIMARY KEY CLUSTERED ([QuoteId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Quote_QuoteStatus] FOREIGN KEY ([QuoteStatusId]) REFERENCES [common].[QuoteStatus] ([Id]),
    CONSTRAINT [FK_Quote_Tenant] FOREIGN KEY ([TenantId]) REFERENCES [security].[Tenant] ([Id])
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
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'QuoteId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'DeclineReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'DeclineReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'DeclineReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'DeclineReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'DeclineReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'DeclineReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'quote', @level1type = N'TABLE', @level1name = N'Quote', @level2type = N'COLUMN', @level2name = N'CreatedBy';


CREATE TABLE [broker].[RepresentativeFscaLicenseCategory] (
    [Id]                     INT          IDENTITY (1, 1) NOT NULL,
    [RepresentativeId]       INT          NOT NULL,
    [FscaLicenseCategoryId]  INT          NOT NULL,
    [BrokerageId]            INT          NOT NULL,
    [AdviceDateActive]       DATE         NULL,
    [IntermediaryDateActive] DATE         NULL,
    [SusDateActive]          DATE         NULL,
    [IsDeleted]              BIT          NOT NULL,
    [CreatedBy]              VARCHAR (50) NOT NULL,
    [CreatedDate]            DATETIME     NOT NULL,
    [ModifiedBy]             VARCHAR (50) NOT NULL,
    [ModifiedDate]           DATETIME     NOT NULL,
    CONSTRAINT [PK_AgentFscaLicenseCategory] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_AgentFscaLicenseCategory_FscaLicenseCategory] FOREIGN KEY ([FscaLicenseCategoryId]) REFERENCES [broker].[FscaLicenseCategory] ([Id]),
    CONSTRAINT [FK_RepresentativeFscaLicenseCategory_Brokerage] FOREIGN KEY ([BrokerageId]) REFERENCES [broker].[Brokerage] ([Id]),
    CONSTRAINT [FK_RepresentativeFscaLicenseCategory_Representative] FOREIGN KEY ([RepresentativeId]) REFERENCES [broker].[Representative] ([Id])
);




GO

GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'SusDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'SusDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'SusDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'SusDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'SusDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'SusDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'IntermediaryDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'IntermediaryDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'IntermediaryDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'IntermediaryDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'IntermediaryDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'IntermediaryDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'FscaLicenseCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'FscaLicenseCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'FscaLicenseCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'FscaLicenseCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'FscaLicenseCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'FscaLicenseCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'AdviceDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'AdviceDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'AdviceDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'AdviceDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'AdviceDateActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepresentativeFscaLicenseCategory', @level2type = N'COLUMN', @level2name = N'AdviceDateActive';


GO
CREATE NONCLUSTERED INDEX [IX_RepresentativeFscaLicenseCategory_RepresentativeId_IsDeleted]
    ON [broker].[RepresentativeFscaLicenseCategory]([RepresentativeId] ASC, [IsDeleted] ASC);


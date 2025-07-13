CREATE TABLE [pension].[PensionBeneficiary] (
    [PensionBeneficiaryId] INT          IDENTITY (1, 1) NOT NULL,
    [PensionClaimMapId]    INT          NULL,
    [FamilyUnit]           INT          NULL,
    [BeneficiaryTypeId]    INT          NOT NULL,
    [PersonId]             INT          NULL,
    [IsActive]             BIT          CONSTRAINT [DF_PensionBeneficiary_IsActive] DEFAULT ((1)) NOT NULL,
    [IsDeleted]            BIT          CONSTRAINT [DF_PensionBeneficiary_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]            VARCHAR (50) NOT NULL,
    [CreatedDate]          DATETIME     CONSTRAINT [DF_PensionBeneficiary_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]           VARCHAR (50) NOT NULL,
    [ModifiedDate]         DATETIME     CONSTRAINT [DF_PensionBeneficiary_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK__pension_PensionBeneficiary] PRIMARY KEY CLUSTERED ([PensionBeneficiaryId] ASC),
    CONSTRAINT [FK_PensionBeneficiary_BeneficiaryType] FOREIGN KEY ([BeneficiaryTypeId]) REFERENCES [common].[BeneficiaryType] ([Id]),
    CONSTRAINT [FK_PensionBeneficiary_PensionClaimMap] FOREIGN KEY ([PensionClaimMapId]) REFERENCES [pension].[PensionClaimMap] ([PensionClaimMapId]),
    CONSTRAINT [FK_PensionBeneficiary_Person] FOREIGN KEY ([PersonId]) REFERENCES [client].[Person] ([RolePlayerId])
);










GO



GO



GO



GO



GO



GO



GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'PensionClaimMapId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'PensionClaimMapId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'PensionClaimMapId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'PensionClaimMapId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'PensionClaimMapId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'PensionClaimMapId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'PensionBeneficiaryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'PensionBeneficiaryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'PensionBeneficiaryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'PensionBeneficiaryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'PensionBeneficiaryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'PensionBeneficiaryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'IsActive';


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
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'BeneficiaryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'BeneficiaryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'BeneficiaryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'BeneficiaryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'BeneficiaryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBeneficiary', @level2type = N'COLUMN', @level2name = N'BeneficiaryTypeId';


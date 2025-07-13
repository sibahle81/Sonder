CREATE TABLE [Load].[PremiumListingPolicyPremiumMovement] (
    [Id]                        INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]            UNIQUEIDENTIFIER NOT NULL,
    [PolicyId]                  INT              NOT NULL,
    [CurrentInstallmentPremium] DECIMAL (18, 2)  NOT NULL,
    [CurrentAnnualPremium]      DECIMAL (18, 2)  NOT NULL,
    [NewInstallmentPremium]     DECIMAL (18, 2)  NOT NULL,
    [NewAnnualPremium]          DECIMAL (18, 2)  NOT NULL,
    [IsProcessed]               BIT              CONSTRAINT [DF_PremiumListingPolicyPremiumMovement_IsProcessed] DEFAULT ((0)) NOT NULL,
    [Remarks]                   VARCHAR (250)    NULL,
    [IsDeleted]                 BIT              CONSTRAINT [DF_PremiumListingPolicyPremiumMovement_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]                 VARCHAR (64)     NOT NULL,
    [CreatedDate]               DATETIME         CONSTRAINT [DF_PremiumListingPolicyPremiumMovement_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                VARCHAR (64)     NOT NULL,
    [ModifiedDate]              DATETIME         CONSTRAINT [DF_PremiumListingPolicyPremiumMovement_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK__PremiumListingPolicyPremiumMovement] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO


 
GO


GO


GO


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'Remarks';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'Remarks';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'Remarks';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'Remarks';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'Remarks';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'Remarks';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'NewInstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'NewInstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'NewInstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'NewInstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'NewInstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'NewInstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'NewAnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'NewAnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'NewAnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'NewAnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'NewAnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'NewAnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CurrentInstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CurrentInstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CurrentInstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CurrentInstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CurrentInstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CurrentInstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CurrentAnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CurrentAnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CurrentAnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CurrentAnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CurrentAnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CurrentAnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingPolicyPremiumMovement', @level2type = N'COLUMN', @level2name = N'CreatedBy';


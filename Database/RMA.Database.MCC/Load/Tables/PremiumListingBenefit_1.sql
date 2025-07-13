CREATE TABLE [Load].[PremiumListingBenefit] (
    [FileIdentifier]             UNIQUEIDENTIFIER                                     NOT NULL,
    [ProductOptionId]            INT                                                  NOT NULL,
    [BenefitId]                  INT                                                  NOT NULL,
    [BenefitName]                VARCHAR (128)                                        NOT NULL,
    [CoverMemberTypeId]          INT                                                  NOT NULL,
    [BenefitRate]                DECIMAL (18, 10)                                     NOT NULL,
    [BenefitAmount]              DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [MaxPersonsPerProductOption] INT                                                  NOT NULL,
    [MaxPersonsPerBenefit]       INT                                                  NOT NULL,
    [MinEntryAge]                INT                                                  NOT NULL,
    [MaxEntryAge]                INT                                                  NOT NULL,
    [CapCover]                   DECIMAL (18, 2)                                      NOT NULL,
    [EuropAssistFee]             DECIMAL (18, 10)                                     CONSTRAINT [DF_PremiumListingBenefit_EuropAssistFee] DEFAULT ((0.0)) NOT NULL,
    [BenefitTypeId]              INT                                                  NULL,
    CONSTRAINT [PK__PremiumL__4BA94054BB44CFB2] PRIMARY KEY CLUSTERED ([FileIdentifier] ASC, [BenefitId] ASC)
);










GO
CREATE NONCLUSTERED INDEX [idx_premiumlistingbenefit_benefitid]
    ON [Load].[PremiumListingBenefit]([BenefitId] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_premiumlistingbenefit_productoptionid]
    ON [Load].[PremiumListingBenefit]([ProductOptionId] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_premiumlistingbenefit_covermembertypeid]
    ON [Load].[PremiumListingBenefit]([CoverMemberTypeId] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_premiumlistingbenefit_benefitname]
    ON [Load].[PremiumListingBenefit]([BenefitName] ASC);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MinEntryAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MinEntryAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MinEntryAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MinEntryAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MinEntryAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MinEntryAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxPersonsPerProductOption';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxPersonsPerProductOption';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxPersonsPerProductOption';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxPersonsPerProductOption';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxPersonsPerProductOption';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxPersonsPerProductOption';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxPersonsPerBenefit';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxPersonsPerBenefit';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxPersonsPerBenefit';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxPersonsPerBenefit';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxPersonsPerBenefit';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxPersonsPerBenefit';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxEntryAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxEntryAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxEntryAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxEntryAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxEntryAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'MaxEntryAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'EuropAssistFee';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'EuropAssistFee';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'EuropAssistFee';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'EuropAssistFee';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'EuropAssistFee';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'EuropAssistFee';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'CapCover';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'CapCover';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'CapCover';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'CapCover';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'CapCover';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'CapCover';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingBenefit', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


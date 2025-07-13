CREATE TABLE [policy].[PremiumListingPolicy] (
    [Id]                   INT                                                IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]       VARCHAR (128)                                      NOT NULL,
    [AccountHolder]        VARCHAR (128) MASKED WITH (FUNCTION = 'default()') NULL,
    [PolicyOwnerId]        INT                                                NULL,
    [CompanyName]          VARCHAR (64)                                       NULL,
    [PolicyId]             INT                                                NULL,
    [PolicyNumber]         VARCHAR (30) MASKED WITH (FUNCTION = 'default()')  NULL,
    [PolicyInceptionDate]  DATE                                               NULL,
    [CommissionPercentage] FLOAT (53)                                         NULL,
    [AdminPercentage]      FLOAT (53)                                         NULL,
    [ProductOptionId]      INT                                                NULL,
    [BenefitId]            INT                                                NULL,
    [BenefitName]          VARCHAR (64)                                       NULL,
    [CoverMemberTypeId]    INT                                                NULL,
    [PaymentFrequencyId]   INT                                                NULL,
    [Premium]              FLOAT (53)                                         NULL,
    [BenefitAmount]        FLOAT (53) MASKED WITH (FUNCTION = 'default()')    NULL,
    [CapCoverLessFive]     FLOAT (53)                                         NULL,
    [CapCoverLessThirteen] FLOAT (53)                                         NULL,
    [CapCoverOverThirteen] FLOAT (53)                                         NULL,
    [MinimumAge]           INT                                                NULL,
    [MaximumAge]           INT                                                NULL,
    [MaxPersons]           INT                                                NULL,
    [MaxSpouses]           INT                                                NULL,
    [MaxChildren]          INT                                                NULL,
    [IsGroup]              BIT                                                NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);




GO
CREATE NONCLUSTERED INDEX [idx_premiumlistingpolicy_identifier]
    ON [policy].[PremiumListingPolicy]([FileIdentifier] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_premiumlistingpolicy_covermembertype]
    ON [policy].[PremiumListingPolicy]([FileIdentifier] ASC, [CoverMemberTypeId] ASC);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'Premium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'Premium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'Premium';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'Premium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'Premium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'Premium';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyOwnerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyOwnerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyOwnerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyOwnerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyOwnerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyOwnerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyInceptionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyInceptionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyInceptionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyInceptionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyInceptionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyInceptionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PaymentFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PaymentFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PaymentFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PaymentFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PaymentFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'PaymentFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MinimumAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MinimumAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MinimumAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MinimumAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MinimumAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MinimumAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxSpouses';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxSpouses';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxSpouses';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxSpouses';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxSpouses';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxSpouses';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxPersons';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxPersons';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxPersons';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxPersons';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxPersons';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxPersons';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaximumAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaximumAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaximumAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaximumAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaximumAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaximumAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxChildren';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxChildren';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxChildren';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxChildren';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxChildren';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'MaxChildren';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'IsGroup';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'IsGroup';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'IsGroup';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'IsGroup';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'IsGroup';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'IsGroup';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CompanyName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CompanyName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CompanyName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CompanyName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CompanyName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CompanyName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverOverThirteen';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverOverThirteen';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverOverThirteen';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverOverThirteen';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverOverThirteen';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverOverThirteen';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverLessThirteen';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverLessThirteen';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverLessThirteen';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverLessThirteen';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverLessThirteen';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverLessThirteen';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverLessFive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverLessFive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverLessFive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverLessFive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverLessFive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'CapCoverLessFive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'AccountHolder';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'AccountHolder';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'AccountHolder';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'AccountHolder';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'AccountHolder';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PremiumListingPolicy', @level2type = N'COLUMN', @level2name = N'AccountHolder';


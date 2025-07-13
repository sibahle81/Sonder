CREATE TABLE [Load].[PremiumListingBenefit] (
    [FileIdentifier]             UNIQUEIDENTIFIER NOT NULL,
    [ProductOptionId]            INT              NOT NULL,
    [BenefitId]                  INT              NOT NULL,
    [BenefitName]                VARCHAR (64)     NOT NULL,
    [CoverMemberTypeId]          INT              NOT NULL,
    [BenefitRate]                DECIMAL (18, 2)  NOT NULL,
    [BenefitAmount]              DECIMAL (18, 2)  NOT NULL,
    [MaxPersonsPerProductOption] INT              NOT NULL,
    [MaxPersonsPerBenefit]       INT              NOT NULL,
    [MinEntryAge]                INT              NOT NULL,
    [MaxEntryAge]                INT              NOT NULL,
    [CapCover]                   DECIMAL (18, 2)  NOT NULL,
    PRIMARY KEY CLUSTERED ([FileIdentifier] ASC, [BenefitId] ASC)
);
GO

CREATE NONCLUSTERED INDEX [idx_premiumlistingbenefit_benefitid]
    ON [Load].[PremiumListingBenefit]([BenefitId] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_premiumlistingbenefit_benefitname]
    ON [Load].[PremiumListingBenefit]([BenefitName] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_premiumlistingbenefit_covermembertypeid]
    ON [Load].[PremiumListingBenefit]([CoverMemberTypeId] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_premiumlistingbenefit_productoptionid]
    ON [Load].[PremiumListingBenefit]([ProductOptionId] ASC);
GO


CREATE TABLE [client].[MinimumAllowablePremium] (
    [MinimumAllowablePremiumId]               INT             IDENTITY (1, 1) NOT NULL,
    [IndustryClassDeclarationConfigurationId] INT             NOT NULL,
    [MinimumPremium]                          DECIMAL (18, 2) NOT NULL,
    [EffectiveFrom]                           DATE            NOT NULL,
    [EffectiveTo]                             DATE            NULL,
    PRIMARY KEY CLUSTERED ([MinimumAllowablePremiumId] ASC),
    CONSTRAINT [FK_MinimumAllowablePremium_IndustryClassDeclarationConfiguration] FOREIGN KEY ([IndustryClassDeclarationConfigurationId]) REFERENCES [client].[IndustryClassDeclarationConfiguration] ([IndustryClassDeclarationConfigurationId])
);


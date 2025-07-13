CREATE TABLE [client].[InflationPercentage] (
    [InflationPercentageId]                   INT             IDENTITY (1, 1) NOT NULL,
    [IndustryClassDeclarationConfigurationId] INT             NOT NULL,
    [Percentage]                              DECIMAL (18, 2) NOT NULL,
    [EffectiveFrom]                           DATE            NOT NULL,
    [EffectiveTo]                             DATE            NULL,
    PRIMARY KEY CLUSTERED ([InflationPercentageId] ASC),
    CONSTRAINT [FK_InflationPercentage_IndustryClassDeclarationConfiguration] FOREIGN KEY ([IndustryClassDeclarationConfigurationId]) REFERENCES [client].[IndustryClassDeclarationConfiguration] ([IndustryClassDeclarationConfigurationId])
);


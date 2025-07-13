CREATE TABLE [client].[DeclarationPenaltyPercentage] (
    [DeclarationPenaltyPercentageId]          INT             IDENTITY (1, 1) NOT NULL,
    [IndustryClassDeclarationConfigurationId] INT             NOT NULL,
    [PenaltyPercentage]                       DECIMAL (18, 2) NOT NULL,
    [EffectiveFrom]                           DATE            NOT NULL,
    [EffectiveTo]                             DATE            NULL,
    PRIMARY KEY CLUSTERED ([DeclarationPenaltyPercentageId] ASC),
    CONSTRAINT [FK_DeclarationPenaltyPercentage_IndustryClassDeclarationConfiguration] FOREIGN KEY ([IndustryClassDeclarationConfigurationId]) REFERENCES [client].[IndustryClassDeclarationConfiguration] ([IndustryClassDeclarationConfigurationId])
);


CREATE TABLE [client].[LiveInAllowance] (
    [LiveInAllowanceId]                       INT             IDENTITY (1, 1) NOT NULL,
    [IndustryClassDeclarationConfigurationId] INT             NOT NULL,
    [Allowance]                               DECIMAL (18, 2) NOT NULL,
    [EffectiveFrom]                           DATE            NOT NULL,
    [EffectiveTo]                             DATE            NULL,
    PRIMARY KEY CLUSTERED ([LiveInAllowanceId] ASC),
    CONSTRAINT [FK_LiveInAllowance_IndustryClassDeclarationConfiguration] FOREIGN KEY ([IndustryClassDeclarationConfigurationId]) REFERENCES [client].[IndustryClassDeclarationConfiguration] ([IndustryClassDeclarationConfigurationId])
);


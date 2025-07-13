CREATE TABLE [client].[MaxAverageEarnings] (
    [MaxAverageEarningsId]                    INT             IDENTITY (1, 1) NOT NULL,
    [IndustryClassDeclarationConfigurationId] INT             NOT NULL,
    [MaxAverageEarnings]                      DECIMAL (18, 2) NOT NULL,
    [EffectiveFrom]                           DATE            NOT NULL,
    [EffectiveTo]                             DATE            NULL,
    [MinAverageEarnings]                      DECIMAL (18, 2) NULL,
    PRIMARY KEY CLUSTERED ([MaxAverageEarningsId] ASC),
    CONSTRAINT [FK_MaxAverageEarnings_IndustryClassDeclarationConfiguration] FOREIGN KEY ([IndustryClassDeclarationConfigurationId]) REFERENCES [client].[IndustryClassDeclarationConfiguration] ([IndustryClassDeclarationConfigurationId])
);




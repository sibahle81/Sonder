CREATE TABLE [client].[IndustryClassDeclarationConfiguration] (
    [IndustryClassDeclarationConfigurationId] INT             IDENTITY (1, 1) NOT NULL,
    [IndustryClassId]                         INT             NOT NULL,
    [RenewalPeriodStartMonth]                 INT             NOT NULL,
    [RenewalPeriodStartDayOfMonth]            INT             NOT NULL,
    [VarianceThreshold]                       DECIMAL (18, 2) NULL,
    PRIMARY KEY CLUSTERED ([IndustryClassDeclarationConfigurationId] ASC)
);




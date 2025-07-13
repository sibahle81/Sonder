CREATE TABLE [billing].[IndustryFinancialYear] (
    [IndustryFinancialYearId] INT          IDENTITY (1, 1) NOT NULL,
    [IndustryClassId]         INT          NOT NULL,
    [StartDay]                INT          NOT NULL,
    [StartMonth]              INT          NOT NULL,
    [EndDay]                  INT          NOT NULL,
    [EndMonth]                INT          NOT NULL,
    [IsDeleted]               BIT          NOT NULL,
    [CreatedBy]               VARCHAR (50) NOT NULL,
    [CreatedDate]             DATETIME     NOT NULL,
    [ModifiedBy]              VARCHAR (50) NOT NULL,
    [ModifiedDate]            DATETIME     NOT NULL,
    [StartYear]               INT          NULL,
    [EndYear]                 INT          NULL,
    [IsActive]                BIT          CONSTRAINT [DF_IndustryFinancialYear_IsActive] DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_IndustryFinancialYear] PRIMARY KEY CLUSTERED ([IndustryFinancialYearId] ASC),
    CONSTRAINT [FK_IndustryFinancialYear_IndustryClass] FOREIGN KEY ([IndustryFinancialYearId]) REFERENCES [common].[IndustryClass] ([Id])
);


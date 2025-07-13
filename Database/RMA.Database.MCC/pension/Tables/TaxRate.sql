CREATE TABLE [pension].[TaxRate] (
    [Id]                INT          IDENTITY (1, 1) NOT NULL,
    [FromIncome]        DECIMAL (18) NOT NULL,
    [ToIncome]          DECIMAL (18) NOT NULL,
    [StandardTaxRate]   DECIMAL (18) NOT NULL,
    [TaxPercentageRate] DECIMAL (18) NOT NULL,
    [TaxRateYearId]     INT          NOT NULL,
    [IsActive]          BIT          NOT NULL,
    [IsDeleted]         BIT          NOT NULL,
    [CreatedBy]         VARCHAR (50) NOT NULL,
    [CreatedDate]       DATETIME     NOT NULL,
    [ModifiedBy]        VARCHAR (50) NOT NULL,
    [ModifiedDate]      DATETIME     NOT NULL,
    CONSTRAINT [PK__TaxRate__3214EC076E3F4932] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TaxRate_TaxRateYear] FOREIGN KEY ([TaxRateYearId]) REFERENCES [pension].[TaxYear] ([Id])
);


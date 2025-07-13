CREATE TABLE [common].[AdditionalTaxType] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [Additional_TaxType] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 95),
    UNIQUE NONCLUSTERED ([Name] ASC)
);


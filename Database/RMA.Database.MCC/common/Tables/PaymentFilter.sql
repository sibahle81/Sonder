CREATE TABLE [common].[PaymentFilter] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_common.PaymentFilter] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [AK_common.PaymentFilter_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);


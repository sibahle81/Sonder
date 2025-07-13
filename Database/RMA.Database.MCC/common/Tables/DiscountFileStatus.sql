CREATE TABLE [common].[DiscountFileStatus] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_common.DiscountFileStatus] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [PK_common.DiscountFileStatus_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);


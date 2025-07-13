CREATE TABLE [common].[PartnerCompany] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_common.PartnerCompany] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [AK_common.PartnerCompany_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);


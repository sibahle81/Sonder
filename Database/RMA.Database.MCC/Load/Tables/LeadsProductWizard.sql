CREATE TABLE [Load].[LeadsProductWizard] (
    [Id]             INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier] UNIQUEIDENTIFIER NOT NULL,
    [LeadId]         INT              NULL,
    [Product]        INT              NULL,
    [ProductOption]  INT              NULL,
    [ExcelRowNumber] VARCHAR (50)     NULL,
    CONSTRAINT [PK__LeadsProductWizard__3214EC07FA2ECE41] PRIMARY KEY CLUSTERED ([Id] ASC)
);


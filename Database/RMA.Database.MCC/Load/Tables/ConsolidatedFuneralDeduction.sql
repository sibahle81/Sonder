CREATE TABLE [Load].[ConsolidatedFuneralDeduction] (
    [Id]             INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier] UNIQUEIDENTIFIER NOT NULL,
    [IdNumber]       VARCHAR (32)     NOT NULL,
    [Employer]       VARCHAR (128)    NULL,
    [Department]     VARCHAR (128)    NULL,
    [PersalNumber]   VARCHAR (64)     NULL,
    CONSTRAINT [PK__ConsolidatedFuneralDeduction] PRIMARY KEY CLUSTERED ([Id] ASC)
);


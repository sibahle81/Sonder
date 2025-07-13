CREATE TABLE [Load].[ConsolidatedFuneralInsurance] (
    [Id]                          INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]              UNIQUEIDENTIFIER NOT NULL,
    [IdNumber]                    VARCHAR (32)     NOT NULL,
    [PreviousInsurer]             VARCHAR (128)    NULL,
    [PreviousInsurerPolicyNumber] VARCHAR (64)     NULL,
    [PreviousInsurerStartDate]    VARCHAR (16)     NULL,
    [PreviousInsurerEndDate]      VARCHAR (16)     NULL,
    [SumAssured]                  VARCHAR (16)     NULL,
    CONSTRAINT [PK__ConsolidatedFuneralInsurance] PRIMARY KEY CLUSTERED ([Id] ASC)
);


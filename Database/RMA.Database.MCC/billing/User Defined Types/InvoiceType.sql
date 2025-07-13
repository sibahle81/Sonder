CREATE TYPE [billing].[InvoiceType] AS TABLE (
    [InvoiceId]             INT             NOT NULL,
    [Amount]                DECIMAL (18, 2) NOT NULL,
    [RolePlayerId]          INT             NOT NULL,
    [TransactionTypeLinkId] INT             NOT NULL,
    [TransactionDate]       DATE            NOT NULL,
    [RmaReference]          VARCHAR (MAX)   NOT NULL,
    [Reason]                VARCHAR (MAX)   NOT NULL,
    [TransactionType]       INT             NOT NULL);


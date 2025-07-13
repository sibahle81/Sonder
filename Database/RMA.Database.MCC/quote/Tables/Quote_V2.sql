CREATE TABLE [quote].[Quote_V2] (
    [QuoteId]         INT              IDENTITY (1, 1) NOT NULL,
    [TenantId]        INT              NOT NULL,
    [LeadId]          INT              NOT NULL,
    [UnderwriterId]   INT              NOT NULL,
    [ProductId]       INT              NOT NULL,
    [QuotationNumber] VARCHAR (50)     NOT NULL,
    [QuoteStatusId]   INT              NOT NULL,
    [DeclineReason]   VARCHAR (MAX)    NULL,
    [TotalPremium]    DECIMAL (38, 10) NULL,
    [IsDeleted]       BIT              NOT NULL,
    [CreatedBy]       VARCHAR (50)     NOT NULL,
    [CreatedDate]     DATETIME         NOT NULL,
    [ModifiedBy]      VARCHAR (50)     NOT NULL,
    [ModifiedDate]    DATETIME         NOT NULL,
    CONSTRAINT [PK_Quote_V2] PRIMARY KEY CLUSTERED ([QuoteId] ASC)
);


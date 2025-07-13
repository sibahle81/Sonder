CREATE TABLE [claim].[PaymentReversal] (
    [Transaction_ID]     INT           NULL,
    [Claim_Number]       VARCHAR (50)  NULL,
    [Branch]             VARCHAR (50)  NULL,
    [Requested_reversal] VARCHAR (50)  NOT NULL,
    [Debtor_created]     VARCHAR (80)  NOT NULL,
    [Reversal_Reason]    VARCHAR (255) NULL,
    [Reversal_amount]    MONEY         NOT NULL,
    [Date]               DATETIME      NOT NULL,
    [Class]              VARCHAR (50)  NULL,
    [Product]            VARCHAR (50)  NULL,
    [ProductId]          INT           NULL,
    [Authorised_By]      VARCHAR (50)  NOT NULL
);


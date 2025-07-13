CREATE TABLE [claim].[PaymentReversalTest] (
    [Transaction_ID]     INT             NOT NULL,
    [Claim_Number]       VARCHAR (50)    NULL,
    [Branch]             VARCHAR (50)    NOT NULL,
    [Requested_reversal] VARCHAR (50)    NOT NULL,
    [Debtor_created]     VARCHAR (80)    NOT NULL,
    [Reversal_Reason]    VARCHAR (255)   NULL,
    [Reversal_amount]    DECIMAL (18, 2) NOT NULL,
    [Date]               DATETIME        NOT NULL,
    [Class]              VARCHAR (50)    NOT NULL,
    [Product]            VARCHAR (50)    NOT NULL,
    [ProductId]          INT             NOT NULL,
    [Authorised_By]      VARCHAR (50)    NOT NULL
);


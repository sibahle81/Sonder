CREATE TABLE [finance].[AbilityPosting3] (
    [REFERENCE]           VARCHAR (50) NULL,
    [Transaction Date]    DATETIME     NOT NULL,
    [NO. OF TRANSACTIONS] VARCHAR (1)  NOT NULL,
    [COMPANY]             INT          NOT NULL,
    [BRANCH]              INT          NOT NULL,
    [PRODUCT]             VARCHAR (50) NOT NULL,
    [COST CENTRE]         VARCHAR (50) NOT NULL,
    [IS CHART NO]         INT          NULL,
    [IS CHART NAME]       VARCHAR (50) NOT NULL,
    [BS CHART NO]         INT          NULL,
    [BS CHART NAME]       VARCHAR (50) NOT NULL,
    [PROCESSED]           VARCHAR (3)  NOT NULL,
    [DAILYTOTAL]          MONEY        NOT NULL
);


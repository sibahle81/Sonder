CREATE TABLE [finance].[AbilityPosting2] (
    [REFERENCE]           VARCHAR (50) NULL,
    [TRANSACTIONDATE]     DATETIME     NOT NULL,
    [NO. OF TRANSACTIONS] INT          NOT NULL,
    [COMPANYNO]           INT          NOT NULL,
    [BRANCHNO]            INT          NOT NULL,
    [LEVEL1]              VARCHAR (50) NOT NULL,
    [LEVEL2]              VARCHAR (50) NOT NULL,
    [CHARTISNO]           INT          NULL,
    [CHARTISNAME]         VARCHAR (50) NOT NULL,
    [CHARTBSNO]           INT          NULL,
    [CHARTBSNAME]         VARCHAR (50) NOT NULL,
    [ISPROCESSED]         BIT          NOT NULL,
    [DAILYTOTAL]          MONEY        NOT NULL
);


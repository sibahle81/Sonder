CREATE TABLE [common].[TmpDebtorsDetails] (
    [DebtorsId]       INT             IDENTITY (1, 1) NOT NULL,
    [CustomerNumber]  VARCHAR (10)    NULL,
    [CustomerName]    VARCHAR (50)    NULL,
    [Book]            VARCHAR (20)    NULL,
    [OpneningBalance] DECIMAL (18, 2) NOT NULL,
    [CurrentBalance]  DECIMAL (18, 2) NOT NULL,
    [AssignedOn]      DATETIME        NOT NULL,
    [PTP]             INT             NULL,
    [LastChanged]     VARCHAR (20)    NULL,
    [LastStatus]      VARCHAR (20)    NULL,
    [OverDueBy]       INT             NULL,
    [CreatedBy]       VARCHAR (50)    NOT NULL,
    [CreatedDate]     DATETIME        NOT NULL,
    [ModifiedBy]      VARCHAR (50)    NOT NULL,
    [ModifiedDate]    DATETIME        NOT NULL
);


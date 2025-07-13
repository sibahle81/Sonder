CREATE TABLE [debt].[ManagmentTransactions] (
    [Id]                                INT           IDENTITY (1, 1) NOT NULL,
    [FinPayeeId]                        INT           NOT NULL,
    [AssignedCollectionAgent]           VARCHAR (200) NOT NULL,
    [AssignedId]                        INT           NOT NULL,
    [AssignOnDate]                      DATETIME      NOT NULL,
    [PTPCount]                          INT           NOT NULL,
    [DebtCollectionTransactionStatusId] INT           NOT NULL,
    [IsActive]                          BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]                         BIT           NOT NULL,
    [CreatedBy]                         VARCHAR (100) NOT NULL,
    [CreatedDate]                       DATETIME      NOT NULL,
    [ModifiedBy]                        VARCHAR (100) NOT NULL,
    [ModifiedDate]                      DATETIME      NOT NULL,
    CONSTRAINT [PK_ManagmentTransactions] PRIMARY KEY CLUSTERED ([Id] ASC)
);


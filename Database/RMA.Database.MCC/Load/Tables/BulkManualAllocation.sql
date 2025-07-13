CREATE TABLE [Load].[BulkManualAllocation] (
    [Id]                     INT            IDENTITY (1, 1) NOT NULL,
    [BankAccountNumber]      NVARCHAR (50)  NULL,
    [UserReference]          NVARCHAR (200) NULL,
    [StatementReference]     NVARCHAR (200) NULL,
    [TransactionDate]        NVARCHAR (50)  NULL,
    [Amount]                 NVARCHAR (50)  NULL,
    [Status]                 NVARCHAR (50)  NULL,
    [UserReference2]         NVARCHAR (200) NULL,
    [ReferenceType]          NVARCHAR (100) NULL,
    [Allocatable]            NVARCHAR (10)  NULL,
    [AllocateTo]             NVARCHAR (200) NULL,
    [BulkAllocationFileId]   INT            NOT NULL,
    [Error]                  NVARCHAR (500) NULL,
    [IsDeleted]              BIT            CONSTRAINT [DF__BulkManua__IsDel__4932F28D] DEFAULT ((0)) NOT NULL,
    [LineProcessingStatusId] INT            NULL,
    CONSTRAINT [PK_BulkManualAllocation] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_BulkManualAllocation_BulkManualAllocation1] FOREIGN KEY ([BulkAllocationFileId]) REFERENCES [Load].[BulkAllocationFile] ([BulkAllocationFileId])
);


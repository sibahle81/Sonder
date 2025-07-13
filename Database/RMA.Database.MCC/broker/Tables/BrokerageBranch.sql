CREATE TABLE [broker].[BrokerageBranch] (
    [Id]           INT          IDENTITY (1, 1) NOT NULL,
    [BrokerageId]  INT          NOT NULL,
    [BranchNumber] INT          NOT NULL,
    [IsDeleted]    BIT          NOT NULL,
    [CreatedBy]    VARCHAR (50) NOT NULL,
    [CreatedDate]  DATETIME     NOT NULL,
    [ModifiedBy]   VARCHAR (50) NOT NULL,
    [ModifiedDate] DATETIME     NOT NULL,
    CONSTRAINT [PK_broker.BrokerageBranch] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_BrokerageBranch_Brokerage] FOREIGN KEY ([BrokerageId]) REFERENCES [broker].[Brokerage] ([Id]),
    UNIQUE NONCLUSTERED ([BranchNumber] ASC),
    UNIQUE NONCLUSTERED ([BrokerageId] ASC)
);


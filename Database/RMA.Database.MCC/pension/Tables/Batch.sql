CREATE TABLE [pension].[Batch] (
    [BatchID]       INT          IDENTITY (1, 1) NOT NULL,
    [Year]          SMALLINT     NOT NULL,
    [Month]         TINYINT      NULL,
    [BatchTypeID]   INT          NULL,
    [BatchStatusID] INT          NULL,
    [IsActive]      BIT          DEFAULT ((1)) NOT NULL,
    [IsDeleted]     BIT          NOT NULL,
    [CreatedBy]     VARCHAR (50) NOT NULL,
    [CreatedDate]   DATETIME     NOT NULL,
    [ModifiedBy]    VARCHAR (50) NOT NULL,
    [ModifiedDate]  DATETIME     NOT NULL,
    CONSTRAINT [PK_Pension_Batch_BatchID] PRIMARY KEY CLUSTERED ([BatchID] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Batch_Batch] FOREIGN KEY ([BatchID]) REFERENCES [pension].[Batch] ([BatchID]),
    CONSTRAINT [FK_Batch_BatchStatus] FOREIGN KEY ([BatchStatusID]) REFERENCES [common].[BatchStatus] ([Id]),
    CONSTRAINT [FK_Batch_BatchType] FOREIGN KEY ([BatchTypeID]) REFERENCES [common].[BatchType] ([Id])
);


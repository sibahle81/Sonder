CREATE TABLE [medical].[SOLDetailsRecords_Temp] (
    [DetailId]      INT          IDENTITY (1, 1) NOT NULL,
    [RecordTypeId]  VARCHAR (10) NOT NULL,
    [DetailsRecord] XML          NULL,
    [HeaderId]      INT          NOT NULL,
    [IsAuthorised]  BIT          NULL,
    [IsActive]      BIT          NOT NULL,
    [IsDeleted]     BIT          NOT NULL,
    [CreatedBy]     VARCHAR (50) NOT NULL,
    [CreatedDate]   DATETIME     NOT NULL,
    [ModifiedBy]    VARCHAR (50) NOT NULL,
    [ModifiedDate]  DATETIME     NOT NULL,
    CONSTRAINT [PK_medical_SOLDetailsRecords_Temp] PRIMARY KEY CLUSTERED ([DetailId] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_SOLDetailsRecords_SOLDetailsRecords_Temp] FOREIGN KEY ([HeaderId]) REFERENCES [medical].[SOLHeaderRecords_Temp] ([HeaderId])
);


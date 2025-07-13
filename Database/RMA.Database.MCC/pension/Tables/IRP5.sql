CREATE TABLE [pension].[IRP5] (
    [IRP5ID]        INT          IDENTITY (1, 1) NOT NULL,
    [IRP5Reference] VARCHAR (20) NOT NULL,
    [IndividualID]  INT          NOT NULL,
    [IRP5Date]      DATETIME     NOT NULL,
    [TaxYear]       SMALLINT     NOT NULL,
    [IsIRP5]        BIT          NULL,
    [IsActive]      BIT          DEFAULT ((1)) NOT NULL,
    [IsDeleted]     BIT          NOT NULL,
    [CreatedBy]     VARCHAR (50) NOT NULL,
    [CreatedDate]   DATETIME     NOT NULL,
    [ModifiedBy]    VARCHAR (50) NOT NULL,
    [ModifiedDate]  DATETIME     NOT NULL,
    CONSTRAINT [PK_Pension_IRP5_IRP5ID] PRIMARY KEY CLUSTERED ([IRP5ID] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_IRP5_Individual] FOREIGN KEY ([IndividualID]) REFERENCES [pension].[Individual] ([IndividualId])
);


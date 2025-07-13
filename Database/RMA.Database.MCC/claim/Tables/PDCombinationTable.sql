CREATE TABLE [claim].[PDCombinationTable] (
    [PDCombinationTableId] INT             NOT NULL,
    [HighPDPercentage]     DECIMAL (10, 2) NOT NULL,
    [LowPDPercentage]      DECIMAL (10, 2) NOT NULL,
    [SummedPDPercentage]   DECIMAL (10, 2) NOT NULL,
    [IsDeleted]            BIT             NOT NULL,
    [CreatedBy]            VARCHAR (50)    NOT NULL,
    [CreatedDate]          DATETIME        NOT NULL,
    [ModifiedBy]           VARCHAR (50)    NOT NULL,
    [ModifiedDate]         DATETIME        NOT NULL,
    CONSTRAINT [PK__PDCombinationTable] PRIMARY KEY CLUSTERED ([PDCombinationTableId] ASC)
);


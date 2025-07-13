CREATE TABLE [claim].[NIHLLookup] (
    [NIHLLookupId] INT             NOT NULL,
    [Frequency]    DECIMAL (10, 2) NOT NULL,
    [HLWorse]      DECIMAL (10, 2) NOT NULL,
    [HLBetter]     DECIMAL (10, 2) NOT NULL,
    [PercentageHL] DECIMAL (10, 2) NOT NULL,
    [IsDeleted]    BIT             NOT NULL,
    [CreatedBy]    VARCHAR (50)    NOT NULL,
    [CreatedDate]  DATETIME        NOT NULL,
    [ModifiedBy]   VARCHAR (50)    NOT NULL,
    [ModifiedDate] DATETIME        NOT NULL,
    CONSTRAINT [PK__NIHLLookup] PRIMARY KEY CLUSTERED ([NIHLLookupId] ASC)
);


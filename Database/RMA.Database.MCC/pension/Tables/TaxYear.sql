CREATE TABLE [pension].[TaxYear] (
    [Id]           INT          IDENTITY (1, 1) NOT NULL,
    [Year]         INT          NOT NULL,
    [IsActive]     BIT          NOT NULL,
    [IsDeleted]    BIT          NOT NULL,
    [CreatedBy]    VARCHAR (50) NOT NULL,
    [CreatedDate]  DATETIME     NOT NULL,
    [ModifiedBy]   VARCHAR (50) NOT NULL,
    [ModifiedDate] DATETIME     NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


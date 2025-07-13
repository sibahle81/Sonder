CREATE TABLE [pension].[TaxRebate] (
    [Id]           INT          IDENTITY (1, 1) NOT NULL,
    [Year]         INT          NOT NULL,
    [Primary]      DECIMAL (18) NOT NULL,
    [Secondary]    DECIMAL (18) NOT NULL,
    [Tertiary]     DECIMAL (18) NOT NULL,
    [IsActive]     BIT          NOT NULL,
    [IsDeleted]    BIT          NOT NULL,
    [CreatedBy]    VARCHAR (50) NOT NULL,
    [CreatedDate]  DATETIME     NOT NULL,
    [ModifiedBy]   VARCHAR (50) NOT NULL,
    [ModifiedDate] DATETIME     NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


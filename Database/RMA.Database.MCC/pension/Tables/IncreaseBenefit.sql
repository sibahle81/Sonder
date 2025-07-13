CREATE TABLE [pension].[IncreaseBenefit] (
    [Id]           INT          IDENTITY (1, 1) NOT NULL,
    [IncreaseId]   INT          NOT NULL,
    [Benefit]      VARCHAR (50) NOT NULL,
    [IsActive]     BIT          NOT NULL,
    [IsDeleted]    BIT          NOT NULL,
    [CreatedBy]    VARCHAR (50) NOT NULL,
    [CreatedDate]  DATETIME     NOT NULL,
    [ModifiedBy]   VARCHAR (50) NOT NULL,
    [ModifiedDate] DATETIME     NOT NULL,
    CONSTRAINT [PK_IncreaseBenefit] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_IncreaseBenefit_PensionIncrease] FOREIGN KEY ([IncreaseId]) REFERENCES [pension].[PensionIncrease] ([Id])
);


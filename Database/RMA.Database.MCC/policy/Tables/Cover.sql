CREATE TABLE [policy].[Cover] (
    [CoverId]       INT          IDENTITY (1, 1) NOT NULL,
    [PolicyId]      INT          NOT NULL,
    [EffectiveFrom] DATETIME     NOT NULL,
    [EffectiveTo]   DATETIME     NULL,
    [IsDeleted]     BIT          NOT NULL,
    [CreatedBy]     VARCHAR (50) NOT NULL,
    [CreatedDate]   DATETIME     NOT NULL,
    [ModifiedBy]    VARCHAR (50) NOT NULL,
    [ModifiedDate]  DATETIME     NOT NULL,
    CONSTRAINT [PK_Cover] PRIMARY KEY CLUSTERED ([CoverId] ASC),
    CONSTRAINT [FK_Cover_Policy] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId])
);


CREATE TABLE [pension].[CommutationExpenditure] (
    [Id]            INT          IDENTITY (1, 1) NOT NULL,
    [CommutationId] INT          NOT NULL,
    [Item]          VARCHAR (50) NOT NULL,
    [Amount]        DECIMAL (18) NOT NULL,
    [IsActive]      BIT          CONSTRAINT [DF_CommutationExpenditure_IsActive] DEFAULT ((1)) NOT NULL,
    [IsDeleted]     BIT          CONSTRAINT [DF_CommutationExpenditure_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]     VARCHAR (50) NOT NULL,
    [CreatedDate]   DATETIME     NOT NULL,
    [ModifiedBy]    VARCHAR (50) NOT NULL,
    [ModifiedDate]  DATETIME     NOT NULL,
    CONSTRAINT [PK_CommutationExpenditure] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_CommutationExpenditure_Commutation] FOREIGN KEY ([CommutationId]) REFERENCES [pension].[Commutation] ([Id]) ON DELETE CASCADE ON UPDATE CASCADE
);


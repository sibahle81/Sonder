CREATE TABLE [policy].[PolicyChangeBenefit] (
    [PolicyChangeBenefitId] INT          IDENTITY (1, 1) NOT NULL,
    [PolicyChangeProductId] INT          NOT NULL,
    [OldBenefitId]          INT          NOT NULL,
    [NewBenefitId]          INT          NOT NULL,
    [IsDeleted]             BIT          DEFAULT ((0)) NOT NULL,
    [CreatedBy]             VARCHAR (50) NOT NULL,
    [CreatedDate]           DATETIME     DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]            VARCHAR (50) NOT NULL,
    [ModifiedDate]          DATETIME     DEFAULT (getdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([PolicyChangeBenefitId] ASC),
    CONSTRAINT [FK_PolicyChangeBenefit_NewBenefit] FOREIGN KEY ([NewBenefitId]) REFERENCES [product].[Benefit] ([Id]),
    CONSTRAINT [FK_PolicyChangeBenefit_OldBenefit] FOREIGN KEY ([OldBenefitId]) REFERENCES [product].[Benefit] ([Id]),
    CONSTRAINT [FK_PolicyChangeBenefit_PolicyChangeProduct] FOREIGN KEY ([PolicyChangeProductId]) REFERENCES [policy].[PolicyChangeProduct] ([PolicyChangeProductId])
);


GO
CREATE UNIQUE NONCLUSTERED INDEX [uidx_PolicyChangeBenefit]
    ON [policy].[PolicyChangeBenefit]([PolicyChangeProductId] ASC, [OldBenefitId] ASC);


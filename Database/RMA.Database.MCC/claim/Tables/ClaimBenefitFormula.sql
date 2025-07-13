CREATE TABLE [claim].[ClaimBenefitFormula] (
    [ClaimBenefitFormulaId] INT           IDENTITY (1, 1) NOT NULL,
    [BenefitId]             INT           NOT NULL,
    [Formula]               VARCHAR (MAX) NOT NULL,
    [ClaimEstimateTypeId]   INT           NULL,
    [MinEarningsFormula]    VARCHAR (MAX) NULL,
    [MaxEarningsFormula]    VARCHAR (MAX) NULL,
    [IsDeleted]             BIT           NOT NULL,
    [CreatedBy]             VARCHAR (50)  NOT NULL,
    [CreatedDate]           DATETIME      NOT NULL,
    [ModifiedBy]            VARCHAR (50)  NOT NULL,
    [ModifiedDate]          DATETIME      NOT NULL,
    CONSTRAINT [PK__ClaimBenefitFormula__2418A122E70367B8] PRIMARY KEY CLUSTERED ([ClaimBenefitFormulaId] ASC),
    CONSTRAINT [FK_ClaimBenefitFormula_Benefit] FOREIGN KEY ([BenefitId]) REFERENCES [product].[Benefit] ([Id])
);


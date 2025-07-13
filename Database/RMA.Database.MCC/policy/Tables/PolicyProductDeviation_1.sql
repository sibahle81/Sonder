CREATE TABLE [policy].[PolicyProductDeviation] (
    [ProductDeviationId]     INT          IDENTITY (1, 1) NOT NULL,
    [PolicyId]               INT          NOT NULL,
    [ProductDeviationTypeId] INT          NOT NULL,
    [FromBenefitId]          INT          NOT NULL,
    [ToBenefitId]            INT          NOT NULL,
    [IsDeleted]              BIT          CONSTRAINT [DF_PolicyProductDeviation_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]              VARCHAR (50) CONSTRAINT [DF_PolicyProductDeviation_CreatedBy] DEFAULT ('system@randmutual.co.za') NOT NULL,
    [CreatedDate]            DATETIME     CONSTRAINT [DF_PolicyProductDeviations_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]             VARCHAR (50) CONSTRAINT [DF_PolicyProductDeviation_ModifiedBy] DEFAULT ('system@randmutual.co.za') NOT NULL,
    [ModifiedDate]           DATETIME     CONSTRAINT [DF_PolicyProductDeviation_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_Policy_ProductDeviation] PRIMARY KEY CLUSTERED ([ProductDeviationId] ASC),
    CONSTRAINT [FK_PolicyProductDeviation_FromBenefitId] FOREIGN KEY ([FromBenefitId]) REFERENCES [product].[Benefit] ([Id]),
    CONSTRAINT [FK_PolicyProductDeviation_Policy] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId]),
    CONSTRAINT [FK_PolicyProductDeviation_ProductDeviationType] FOREIGN KEY ([ProductDeviationTypeId]) REFERENCES [common].[ProductDeviationType] ([Id]),
    CONSTRAINT [FK_PolicyProductDeviation_ToBenefitId] FOREIGN KEY ([ToBenefitId]) REFERENCES [product].[Benefit] ([Id])
);


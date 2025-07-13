CREATE TABLE [policy].[PolicyInsuredLifeAdditionalBenefits] (
    [PolicyId]     INT          NOT NULL,
    [RolePlayerId] INT          NOT NULL,
    [BenefitId]    INT          NOT NULL,
    [IsDeleted]    BIT          CONSTRAINT [DF_PolicyInsuredLivesAdditionalBenefits_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]    VARCHAR (50) CONSTRAINT [DF_PolicyInsuredLivesAdditionalBenefits_CreatedBy] DEFAULT ('system@randmutual.co.za') NOT NULL,
    [CreatedDate]  DATETIME     CONSTRAINT [DF_PolicyInsuredLivesAdditionalBenefits_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]   VARCHAR (50) CONSTRAINT [DF_PolicyInsuredLivesAdditionalBenefits_ModifiedBy] DEFAULT ('system@randmutual.co.za') NOT NULL,
    [ModifiedDate] DATETIME     CONSTRAINT [DF_PolicyInsuredLivesAdditionalBenefits_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_PolicyInsuredLivesAdditionalBenefits] PRIMARY KEY CLUSTERED ([PolicyId] ASC, [RolePlayerId] ASC, [BenefitId] ASC),
    CONSTRAINT [FK_PolicyInsuredLivesAdditionalBenefits_Benefit] FOREIGN KEY ([BenefitId]) REFERENCES [product].[Benefit] ([Id]),
    CONSTRAINT [FK_PolicyInsuredLivesAdditionalBenefits_PolicyInsuredLives] FOREIGN KEY ([PolicyId], [RolePlayerId]) REFERENCES [policy].[PolicyInsuredLives] ([PolicyId], [RolePlayerId])
);


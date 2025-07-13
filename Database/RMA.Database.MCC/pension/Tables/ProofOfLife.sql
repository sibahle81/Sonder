CREATE TABLE [pension].[ProofOfLife] (
    [ProofOfLifeId]          INT          IDENTITY (1, 1) NOT NULL,
    [PensionCaseId]          INT          NULL,
    [PersonId]               INT          NOT NULL,
    [IssueDate]              DATETIME     NOT NULL,
    [ExpiryDate]             DATETIME     NOT NULL,
    [BeneficiaryRecipientId] INT          NULL,
    [IsActive]               BIT          NOT NULL,
    [IsDeleted]              BIT          NOT NULL,
    [CreatedBy]              VARCHAR (50) NOT NULL,
    [CreatedDate]            DATETIME     NOT NULL,
    [ModifiedBy]             VARCHAR (50) NOT NULL,
    [ModifiedDate]           DATETIME     NOT NULL,
    CONSTRAINT [PK__ProofOfL__0795212177C64957] PRIMARY KEY CLUSTERED ([ProofOfLifeId] ASC),
    CONSTRAINT [FK_ProofOfLife_PensionBeneficiary] FOREIGN KEY ([BeneficiaryRecipientId]) REFERENCES [pension].[PensionBeneficiary] ([PensionBeneficiaryId]),
    CONSTRAINT [FK_ProofOfLife_PensionCase] FOREIGN KEY ([PensionCaseId]) REFERENCES [pension].[PensionCase] ([PensionCaseId]),
    CONSTRAINT [FK_ProofOfLife_Person] FOREIGN KEY ([PersonId]) REFERENCES [client].[Person] ([RolePlayerId])
);


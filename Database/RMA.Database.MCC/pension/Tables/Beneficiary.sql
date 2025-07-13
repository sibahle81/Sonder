CREATE TABLE [pension].[Beneficiary] (
    [BeneficiaryId]     INT          IDENTITY (1, 1) NOT NULL,
    [ClaimMapId]        INT          NULL,
    [BeneficiaryTypeId] INT          NOT NULL,
    [EffectiveDate]     DATETIME     NOT NULL,
    [ExpiryDate]        DATETIME     NULL,
    [Percentage]        DECIMAL (18) NULL,
    [IsActive]          BIT          NOT NULL,
    [IsDeleted]         BIT          NOT NULL,
    [CreatedBy]         VARCHAR (50) NOT NULL,
    [CreatedDate]       DATETIME     NOT NULL,
    [ModifiedBy]        VARCHAR (50) NOT NULL,
    [ModifiedDate]      DATETIME     NOT NULL,
    [PersonId]          INT          NOT NULL,
    CONSTRAINT [PK__pension_Beneficiary] PRIMARY KEY CLUSTERED ([BeneficiaryId] ASC),
    CONSTRAINT [FK_Beneficiary_BeneficiaryType] FOREIGN KEY ([BeneficiaryTypeId]) REFERENCES [common].[BeneficiaryType] ([Id]),
    CONSTRAINT [FK_Beneficiary_PensionClaimMap] FOREIGN KEY ([ClaimMapId]) REFERENCES [pension].[PensionClaimMap] ([PensionClaimMapId]),
    CONSTRAINT [FK_Beneficiary_Person] FOREIGN KEY ([PersonId]) REFERENCES [client].[Person] ([RolePlayerId])
);




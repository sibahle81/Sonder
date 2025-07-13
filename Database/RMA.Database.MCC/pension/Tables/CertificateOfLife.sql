CREATE TABLE [pension].[CertificateOfLife] (
    [CertificateOfLifeID] INT          IDENTITY (1, 1) NOT NULL,
    [RecipientID]         INT          NOT NULL,
    [PensionCaseID]       INT          NOT NULL,
    [COLIssueDate]        DATETIME     NOT NULL,
    [COLReturnDate]       DATETIME     NULL,
    [COLNumber]           INT          NULL,
    [IsActive]            BIT          DEFAULT ((1)) NOT NULL,
    [IsDeleted]           BIT          NOT NULL,
    [CreatedBy]           VARCHAR (50) NOT NULL,
    [CreatedDate]         DATETIME     NOT NULL,
    [ModifiedBy]          VARCHAR (50) NOT NULL,
    [ModifiedDate]        DATETIME     NOT NULL,
    CONSTRAINT [PK_Pension_CertificateOfLife_CertificateOfLifeID] PRIMARY KEY CLUSTERED ([CertificateOfLifeID] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_CertificateOfLife_CertificateOfLife] FOREIGN KEY ([CertificateOfLifeID]) REFERENCES [pension].[CertificateOfLife] ([CertificateOfLifeID]),
    CONSTRAINT [FK_CertificateOfLife_PensionCase] FOREIGN KEY ([PensionCaseID]) REFERENCES [pension].[PensionCase] ([PensionCaseId]),
    CONSTRAINT [FK_CertificateOfLife_PensionRecipient] FOREIGN KEY ([RecipientID]) REFERENCES [pension].[PensionRecipient] ([PensionRecipientId])
);


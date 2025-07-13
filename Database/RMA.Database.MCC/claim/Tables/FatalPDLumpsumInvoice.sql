CREATE TABLE [claim].[FatalPDLumpsumInvoice] (
    [ClaimInvoiceId]               INT             NOT NULL,
    [Description]                  VARCHAR (255)   NOT NULL,
    [PayeeTypeId]                  INT             NOT NULL,
    [Payee]                        VARCHAR (255)   NOT NULL,
    [NoOfFamilyMembersBeforeDeath] INT             NOT NULL,
    [NoOfFamilyMembersAfterDeath]  INT             NOT NULL,
    [DeceasedContributionToIncome] DECIMAL (18, 2) NOT NULL,
    [TotalFamilyIncome]            DECIMAL (18, 2) NOT NULL,
    [AvgIncomePerFamilyMember]     DECIMAL (18, 2) NOT NULL,
    [IsDeleted]                    BIT             NOT NULL,
    [CreatedBy]                    VARCHAR (50)    NOT NULL,
    [CreatedDate]                  DATETIME        NOT NULL,
    [ModifiedBy]                   VARCHAR (50)    NOT NULL,
    [ModifiedDate]                 DATETIME        NOT NULL,
    [ClaimId]                      INT             NOT NULL,
    CONSTRAINT [PK_FatalPDLumpsumInvoice] PRIMARY KEY CLUSTERED ([ClaimInvoiceId] ASC),
    CONSTRAINT [FK_FatalPDLumpsumInvoice_Claim] FOREIGN KEY ([ClaimId]) REFERENCES [claim].[Claim] ([ClaimId]),
    CONSTRAINT [FK_FatalPDLumpsumInvoice_ClaimInvoice] FOREIGN KEY ([ClaimInvoiceId]) REFERENCES [claim].[ClaimInvoice] ([ClaimInvoiceId])
);


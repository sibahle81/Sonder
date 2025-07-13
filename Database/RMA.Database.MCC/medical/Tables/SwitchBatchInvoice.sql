CREATE TABLE [medical].[SwitchBatchInvoice] (
    [SwitchBatchInvoiceId]        INT             IDENTITY (1, 1) NOT NULL,
    [SwitchBatchId]               INT             NOT NULL,
    [InvoiceId]                   INT             NULL,
    [BatchSequenceNumber]         INT             NULL,
    [SwitchBatchNumber]           VARCHAR (255)   NULL,
    [SwitchTransactionNumber]     VARCHAR (255)   NULL,
    [PracticeNumber]              VARCHAR (255)   NULL,
    [HealthCareProviderName]      VARCHAR (255)   NULL,
    [InvoiceDate]                 DATETIME        NULL,
    [DateSubmitted]               DATETIME        NULL,
    [DateReceived]                DATETIME        NULL,
    [SPInvoiceNumber]             VARCHAR (255)   NULL,
    [SPAccountNumber]             VARCHAR (255)   NULL,
    [TotalInvoiceAmount]          DECIMAL (18, 2) NULL,
    [TotalInvoiceVAT]             DECIMAL (18, 2) NULL,
    [TotalInvoiceAmountInclusive] DECIMAL (18, 2) NULL,
    [DateAdmitted]                DATETIME        NULL,
    [DateDischarged]              DATETIME        NULL,
    [ClaimReferenceNumber]        VARCHAR (50)    NULL,
    [EventDate]                   DATETIME        NULL,
    [Surname]                     VARCHAR (255)   NULL,
    [FirstName]                   VARCHAR (255)   NULL,
    [Initials]                    VARCHAR (255)   NULL,
    [DateOfBirth]                 DATETIME        NULL,
    [IdNumber]                    VARCHAR (20)    NULL,
    [CompanyNumber]               VARCHAR (255)   NULL,
    [PreAuthNumber]               VARCHAR (255)   NULL,
    [PossiblePersonEventId]       INT             NULL,
    [PossibleEventId]             INT             NULL,
    [HealthCareProviderId]        INT             NULL,
    [PreAuthId]                   INT             NULL,
    [IsProcessed]                 BIT             NULL,
    [TreatingDocBHF]              VARCHAR (255)   NULL,
    [EmployerName]                VARCHAR (255)   NULL,
    [ReferringDocBHF]             VARCHAR (255)   NULL,
    [ReferredTo]                  VARCHAR (255)   NULL,
    [HospitalIndicator]           VARCHAR (255)   NULL,
    [SurgeonBHFNumber]            VARCHAR (255)   NULL,
    [AnaesthetistBHFNumber]       VARCHAR (255)   NULL,
    [AssistantBHFNumber]          VARCHAR (255)   NULL,
    [LengthOfStay]                VARCHAR (255)   NULL,
    [FreeTextDiagnosis]           VARCHAR (1024)  NULL,
    [IODReference]                VARCHAR (255)   NULL,
    [PatientGender]               VARCHAR (255)   NULL,
    [DiagnosticCodeType]          VARCHAR (255)   NULL,
    [DisciplineCode]              VARCHAR (255)   NULL,
    [IsActive]                    BIT             CONSTRAINT [DF__SwitchBat__IsAct__5B5AF912] DEFAULT ((1)) NOT NULL,
    [IsDeleted]                   BIT             CONSTRAINT [DF__SwitchBat__IsDel__5C4F1D4B] DEFAULT ((0)) NOT NULL,
    [CreatedBy]                   VARCHAR (50)    NOT NULL,
    [CreatedDate]                 DATETIME        CONSTRAINT [DF__SwitchBat__Creat__5D434184] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                  VARCHAR (50)    NOT NULL,
    [ModifiedDate]                DATETIME        NOT NULL,
    [SwitchInvoiceStatusId]       INT             NULL,
    [ClaimId]                     INT             NULL,
    [ClaimReferenceNumberMatch]   VARCHAR (50)    NULL,
    [ReinstateReason]             VARCHAR (2500)  NULL,
    [SwitchBatchTypeId]      INT   NULL,
    CONSTRAINT [PK_Medical_SwitchBatchInvoice] PRIMARY KEY CLUSTERED ([SwitchBatchInvoiceId] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_SwitchBatchInvoice_Claim] FOREIGN KEY ([ClaimId]) REFERENCES [claim].[Claim] ([ClaimId]),
    CONSTRAINT [FK_SwitchBatchInvoice_HealthCareProvider] FOREIGN KEY ([HealthCareProviderId]) REFERENCES [medical].[HealthCareProvider] ([RolePlayerId]),
    CONSTRAINT [FK_SwitchBatchInvoice_Invoice] FOREIGN KEY ([InvoiceId]) REFERENCES [medical].[Invoice] ([InvoiceId]),
    CONSTRAINT [FK_SwitchBatchInvoice_PreAuthorisation] FOREIGN KEY ([PreAuthId]) REFERENCES [medical].[PreAuthorisation] ([PreAuthId]),
    CONSTRAINT [FK_SwitchBatchInvoice_SwitchBatch] FOREIGN KEY ([SwitchBatchId]) REFERENCES [medical].[SwitchBatch] ([SwitchBatchId]) ON DELETE CASCADE,
    CONSTRAINT [FK_Medical_SwitchBatchInvoice_SwitchBatchTypeId] FOREIGN KEY ([SwitchBatchTypeId]) REFERENCES [common].[SwitchBatchType] ([Id]),
    CONSTRAINT [FK_SwitchBatchInvoice_SwitchInvoiceStatus] FOREIGN KEY ([SwitchInvoiceStatusId]) REFERENCES [common].[SwitchInvoiceStatus] ([Id])
);










GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TreatingDocBHF';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TreatingDocBHF';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TreatingDocBHF';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TreatingDocBHF';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TreatingDocBHF';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TreatingDocBHF';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceVAT';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceVAT';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceVAT';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceVAT';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceVAT';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceVAT';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'TotalInvoiceAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchTransactionNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchTransactionNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchTransactionNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchTransactionNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchTransactionNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchTransactionNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SwitchBatchId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SurgeonBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SurgeonBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SurgeonBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SurgeonBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SurgeonBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SurgeonBHFNumber';


GO



GO



GO



GO



GO



GO



GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SPInvoiceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SPInvoiceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SPInvoiceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SPInvoiceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SPInvoiceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SPInvoiceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SPAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SPAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SPAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SPAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SPAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'SPAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ReferringDocBHF';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ReferringDocBHF';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ReferringDocBHF';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ReferringDocBHF';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ReferringDocBHF';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ReferringDocBHF';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ReferredTo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ReferredTo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ReferredTo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ReferredTo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ReferredTo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ReferredTo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PreAuthNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PreAuthNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PreAuthNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PreAuthNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PreAuthNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PreAuthNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PreAuthId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PreAuthId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PreAuthId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PreAuthId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PreAuthId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PreAuthId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PracticeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PracticeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PracticeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PracticeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PracticeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PracticeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PossiblePersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PossiblePersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PossiblePersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PossiblePersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PossiblePersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PossiblePersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PossibleEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PossibleEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PossibleEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PossibleEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PossibleEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PossibleEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PatientGender';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PatientGender';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Sensitive', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PatientGender';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PatientGender';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PatientGender';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'PatientGender';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'LengthOfStay';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'LengthOfStay';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'LengthOfStay';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'LengthOfStay';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'LengthOfStay';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'LengthOfStay';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IODReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IODReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IODReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IODReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IODReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IODReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'InvoiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'InvoiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'InvoiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'InvoiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'InvoiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'InvoiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'Initials';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'Initials';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'Initials';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'Initials';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'Initials';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'Initials';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HospitalIndicator';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HospitalIndicator';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HospitalIndicator';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HospitalIndicator';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HospitalIndicator';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HospitalIndicator';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HealthCareProviderName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HealthCareProviderName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HealthCareProviderName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HealthCareProviderName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HealthCareProviderName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HealthCareProviderName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HealthCareProviderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HealthCareProviderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HealthCareProviderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HealthCareProviderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HealthCareProviderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'HealthCareProviderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'FreeTextDiagnosis';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'FreeTextDiagnosis';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'FreeTextDiagnosis';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'FreeTextDiagnosis';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'FreeTextDiagnosis';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'FreeTextDiagnosis';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'FirstName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'FirstName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'FirstName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'FirstName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'FirstName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'FirstName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'EventDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'EventDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'EventDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'EventDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'EventDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'EventDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'EmployerName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'EmployerName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'EmployerName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'EmployerName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'EmployerName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'EmployerName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DisciplineCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DisciplineCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DisciplineCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DisciplineCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DisciplineCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DisciplineCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DiagnosticCodeType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DiagnosticCodeType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DiagnosticCodeType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DiagnosticCodeType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DiagnosticCodeType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DiagnosticCodeType';


GO



GO



GO



GO



GO



GO



GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateSubmitted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateSubmitted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateSubmitted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateSubmitted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateSubmitted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateSubmitted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateReceived';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateReceived';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateReceived';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateReceived';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateReceived';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateReceived';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateDischarged';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateDischarged';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateDischarged';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateDischarged';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateDischarged';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateDischarged';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateAdmitted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateAdmitted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateAdmitted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateAdmitted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateAdmitted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'DateAdmitted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CompanyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CompanyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CompanyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CompanyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CompanyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'CompanyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ClaimReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ClaimReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ClaimReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ClaimReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ClaimReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'ClaimReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'BatchSequenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'BatchSequenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'BatchSequenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'BatchSequenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'BatchSequenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'BatchSequenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'AssistantBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'AssistantBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'AssistantBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'AssistantBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'AssistantBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'AssistantBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'AnaesthetistBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'AnaesthetistBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'AnaesthetistBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'AnaesthetistBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'AnaesthetistBHFNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'SwitchBatchInvoice', @level2type = N'COLUMN', @level2name = N'AnaesthetistBHFNumber';


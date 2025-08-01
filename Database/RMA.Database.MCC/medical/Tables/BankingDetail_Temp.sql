﻿CREATE TABLE [medical].[BankingDetail_Temp] (
    [BankingDetailId]     INT           IDENTITY (1, 1) NOT NULL,
    [BankId]              INT           NOT NULL,
    [BankBranchId]        INT           NOT NULL,
    [BankAccountTypeId]   INT           NOT NULL,
    [AccountNumber]       VARCHAR (50)  NULL,
    [PaymentMethodId]     INT           NOT NULL,
    [CurrencyTypeId]      INT           NOT NULL,
    [PrintName]           VARCHAR (255) NULL,
    [AccountHolderName]   VARCHAR (255) NULL,
    [FinancialSystemCode] VARCHAR (12)  NULL,
    [IsAuthorised]        BIT           NOT NULL,
    [IsActive]            BIT           NOT NULL,
    [OwnerType]           INT           NULL,
    [OwnerId]             INT           NULL,
    [IsDeleted]           BIT           NOT NULL,
    [CreatedBy]           VARCHAR (50)  NOT NULL,
    [CreatedDate]         DATETIME      NOT NULL,
    [ModifiedBy]          VARCHAR (50)  NOT NULL,
    [ModifiedDate]        DATETIME      NOT NULL,
    CONSTRAINT [PK_Medical_BankingDetail_Temp_BankingDetailId] PRIMARY KEY CLUSTERED ([BankingDetailId] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_Medical_BankingDetail_Temp_BankAccountTypeId] FOREIGN KEY ([BankAccountTypeId]) REFERENCES [common].[BankAccountType] ([Id]),
    CONSTRAINT [FK_Medical_BankingDetail_Temp_BankBranchId] FOREIGN KEY ([BankBranchId]) REFERENCES [common].[BankBranch] ([Id]),
    CONSTRAINT [FK_Medical_BankingDetail_Temp_BankId] FOREIGN KEY ([BankId]) REFERENCES [common].[Bank] ([Id]),
    CONSTRAINT [FK_Medical_BankingDetail_Temp_CurrencyTypeId] FOREIGN KEY ([CurrencyTypeId]) REFERENCES [common].[CurrencyType_Temp] ([CurrencyTypeId]),
    CONSTRAINT [FK_Medical_BankingDetail_Temp_PaymentMethodId] FOREIGN KEY ([PaymentMethodId]) REFERENCES [common].[PaymentMethod] ([Id])
);


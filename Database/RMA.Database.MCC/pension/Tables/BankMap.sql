CREATE TABLE [pension].[BankMap] (
    [Id]           INT          IDENTITY (1, 1) NOT NULL,
    [ModBankName]  VARCHAR (50) NOT NULL,
    [ModBankId]    INT          NOT NULL,
    [CompBankName] VARCHAR (50) NULL,
    [CompBankId]   INT          NULL,
    [IsActive]     BIT          CONSTRAINT [DF_BankMapping_IsActive] DEFAULT ((0)) NOT NULL,
    [IsDeleted]    BIT          CONSTRAINT [DF_BankMapping_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]    VARCHAR (50) CONSTRAINT [DF_BankMapping_CreatedBy] DEFAULT ('System') NOT NULL,
    [CreatedDate]  DATETIME     CONSTRAINT [DF_BankMapping_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]   VARCHAR (50) CONSTRAINT [DF_BankMapping_ModifiedBy] DEFAULT ('System') NOT NULL,
    [ModifiedDate] DATETIME     CONSTRAINT [DF_BankMapping_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_BankMapping] PRIMARY KEY CLUSTERED ([Id] ASC)
);


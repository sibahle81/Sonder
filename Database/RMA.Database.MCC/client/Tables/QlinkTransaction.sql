CREATE TABLE [client].[QlinkTransaction] (
    [QlinkTransactionId]     INT           IDENTITY (1, 1) NOT NULL,
    [QlinkTransactionTypeId] INT           NOT NULL,
    [ItemType]               VARCHAR (50)  NOT NULL,
    [ItemId]                 INT           NOT NULL,
    [Request]                VARCHAR (MAX) NOT NULL,
    [Response]               VARCHAR (MAX) NULL,
    [StatusCode]             INT           CONSTRAINT [DF_QlinkTransaction_StatusCode] DEFAULT ((0)) NOT NULL,
    [IsDeleted]              BIT           CONSTRAINT [DF_QlinkTransaction_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedDate]            DATETIME      CONSTRAINT [DF_QlinkTransaction_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]              VARCHAR (50)  NOT NULL,
    [ModifiedDate]           DATETIME      CONSTRAINT [DF_QlinkTransaction_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]             VARCHAR (50)  NOT NULL,
    CONSTRAINT [PK__QlinkTra__F6164142C6AACBC0] PRIMARY KEY CLUSTERED ([QlinkTransactionId] ASC),
    CONSTRAINT [FK_QlinkTransaction_QLinkTransactionType] FOREIGN KEY ([QlinkTransactionTypeId]) REFERENCES [common].[QLinkTransactionType] ([Id])
);


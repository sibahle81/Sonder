CREATE TABLE [campaign].[BulkSmsRequestDetail] (
    [BulkSmsRequestDetailId] INT           IDENTITY (1, 1) NOT NULL,
    [BulkSmsRequestHeaderId] INT           NOT NULL,
    [ItemId]                 INT           NOT NULL,
    [ItemType]               VARCHAR (50)  NOT NULL,
    [CellPhoneNumber]        VARCHAR (50)  NOT NULL,
    [WhenToSend]             DATETIME      CONSTRAINT [DF_BulkSmsRequestDetail_WhenToSend] DEFAULT (getdate()) NOT NULL,
    [SmsMessage]             VARCHAR (250) NOT NULL,
    [SmsStatusId]            INT           NOT NULL,
    [SmsProcessedDate]       DATETIME      NULL,
    [SmsSendResponse]        VARCHAR (MAX) NULL,
    [SendAttemptCount]       INT           CONSTRAINT [DF_BulkSmsRequestDetail_SendAttemptCount] DEFAULT ((0)) NOT NULL,
    [IsDeleted]              BIT           CONSTRAINT [DF_BulkSmsDetails_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]              VARCHAR (50)  NOT NULL,
    [CreatedDate]            DATETIME      CONSTRAINT [DF_BulkSmsDetails_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]             VARCHAR (50)  NOT NULL,
    [ModifiedDate]           DATETIME      CONSTRAINT [DF_BulkSmsDetails_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_BulkSmsDetails] PRIMARY KEY CLUSTERED ([BulkSmsRequestDetailId] ASC),
    CONSTRAINT [FK_BulkSmsRequest_SmsStatus] FOREIGN KEY ([SmsStatusId]) REFERENCES [common].[SmsStatus] ([Id]),
    CONSTRAINT [FK_BulkSmsRequestDetail_BulkSmsRequestHeaderId] FOREIGN KEY ([BulkSmsRequestHeaderId]) REFERENCES [campaign].[BulkSmsRequestHeader] ([BulkSmsRequestHeaderId])
);


GO
CREATE NONCLUSTERED INDEX [IX_BulkSmsRequestDetail_SMSMessage]
    ON [campaign].[BulkSmsRequestDetail]([SmsMessage] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_BulkSmsRequestDetail_CellPhoneNumber]
    ON [campaign].[BulkSmsRequestDetail]([CellPhoneNumber] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_BulkSmsRequestDetail]
    ON [campaign].[BulkSmsRequestDetail]([BulkSmsRequestHeaderId] ASC);


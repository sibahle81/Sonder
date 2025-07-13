CREATE TABLE [Load].[ConsolidatedFuneralError] (
    [Id]                   INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]       UNIQUEIDENTIFIER NOT NULL,
    [MainMemberName]       VARCHAR (128)    NULL,
    [MainMemberIdNumber]   VARCHAR (16)     NULL,
    [ErrorCategory]        VARCHAR (128)    NOT NULL,
    [ErrorMessage]         VARCHAR (256)    NOT NULL,
    [ErrorDate]            DATETIME         DEFAULT (getdate()) NOT NULL,
    [NotificationStatusId] INT              DEFAULT ('1') NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] DESC),
    CONSTRAINT [FK_ConsolidatedFuneralError_NotificationStatus] FOREIGN KEY ([NotificationStatusId]) REFERENCES [common].[NotificationStatus] ([Id])
);


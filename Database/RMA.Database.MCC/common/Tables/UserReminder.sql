CREATE TABLE [common].[UserReminder] (
    [UserReminderId]         INT           IDENTITY (1, 1) NOT NULL,
    [UserReminderTypeId]     INT           NOT NULL,
    [UserReminderItemTypeId] INT           NULL,
    [ItemId]                 INT           NULL,
    [Text]                   VARCHAR (500) NOT NULL,
    [AssignedByUserId]       INT           NULL,
    [AssignedToUserId]       INT           NULL,
    [AlertDateTime]          DATETIME      NULL,
    [isDeleted]              BIT           NOT NULL,
    [CreatedBy]              VARCHAR (50)  NOT NULL,
    [CreatedDate]            DATETIME      NOT NULL,
    [ModifiedBy]             VARCHAR (50)  NOT NULL,
    [ModifiedDate]           DATETIME      NOT NULL,
    [LinkUrl]                VARCHAR (255) NULL,
    CONSTRAINT [PK_UserReminder] PRIMARY KEY CLUSTERED ([UserReminderId] ASC)
);


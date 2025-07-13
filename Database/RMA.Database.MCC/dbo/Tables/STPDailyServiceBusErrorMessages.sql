CREATE TABLE [dbo].[STPDailyServiceBusErrorMessages] (
    [STPDailyServiceBusErrorMessagesId] INT           IDENTITY (1, 1) NOT NULL,
    [LogsId]                            INT           NOT NULL,
    [MessageId]                         VARCHAR (50)  NOT NULL,
    [ErrorMessage]                      VARCHAR (MAX) NOT NULL,
    [ErrorMessageTimeStamp]             DATETIME      NOT NULL,
    [ErrorMessageException]             VARCHAR (MAX) NOT NULL,
    [JobRunDate]                        DATETIME      CONSTRAINT [DF_STPDailyServiceBusErrorMessages_JobRunDtae] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_STPDailyServiceBusErrorMessages] PRIMARY KEY CLUSTERED ([STPDailyServiceBusErrorMessagesId] ASC)
);


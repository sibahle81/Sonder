CREATE TABLE [common].[ServiceBusMessage] (
    [ServiceBusMessageId]             INT           IDENTITY (1, 1) NOT NULL,
    [MessageID]                       VARCHAR (100) NOT NULL,
    [From]                            VARCHAR (100) NOT NULL,
    [To]                              VARCHAR (100) NOT NULL,
    [Environment]                     VARCHAR (100) NOT NULL,
    [EnqueuedTime]                    DATETIME      NOT NULL,
    [MessageTaskType]                 VARCHAR (100) NOT NULL,
    [MessageBody]                     VARCHAR (MAX) NOT NULL,
    [CorrelationID]                   VARCHAR (100) NULL,
    [MessageProcessedTime]            DATETIME      NOT NULL,
    [MessageProcessingCompletionTime] DATETIME      NULL,
    [MessageProcessingStatusText]     VARCHAR (MAX) NULL,
    [MessageUniqueId]                 VARCHAR (100) NULL,
    PRIMARY KEY CLUSTERED ([ServiceBusMessageId] ASC)
);

 
GO
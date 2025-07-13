CREATE TABLE [debt].[EmailLogAttachment] (
    [Id]             INT           IDENTITY (1, 1) NOT NULL,
    [EmailLogId]     INT           NOT NULL,
    [FileName]       VARCHAR (250) NOT NULL,
    [AttachmentUri]  VARCHAR (500) NOT NULL,
    [FileType]       VARCHAR (50)  NOT NULL,
    [SaveAttachment] BIT           NOT NULL,
    [SubModuleId]    INT           NOT NULL,
    [IsSend]         BIT           NOT NULL,
    [IsDeleted]      BIT           NOT NULL,
    [CreatedBy]      VARCHAR (100) NOT NULL,
    [CreatedDate]    DATETIME      NOT NULL,
    [ModifiedBy]     VARCHAR (100) NOT NULL,
    [ModifiedDate]   DATETIME      NOT NULL,
    CONSTRAINT [PK_EmailLogAttachment] PRIMARY KEY CLUSTERED ([Id] ASC)
);


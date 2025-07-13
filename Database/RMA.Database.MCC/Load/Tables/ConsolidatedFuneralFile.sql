CREATE TABLE [Load].[ConsolidatedFuneralFile] (
    [Id]             INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier] UNIQUEIDENTIFIER NOT NULL,
    [FileName]       VARCHAR (100)    NOT NULL,
    [IsDeleted]      BIT              NOT NULL,
    [CreatedBy]      VARCHAR (50)     NOT NULL,
    [CreatedDate]    DATETIME         NOT NULL,
    [ModifiedBy]     VARCHAR (50)     NOT NULL,
    [ModifiedDate]   DATETIME         NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


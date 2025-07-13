CREATE TABLE [Load].[BulkAllocationFile] (
    [BulkAllocationFileId]   INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]         UNIQUEIDENTIFIER NOT NULL,
    [FileName]               VARCHAR (100)    NOT NULL,
    [IsDeleted]              BIT              NOT NULL,
    [CreatedBy]              VARCHAR (50)     NOT NULL,
    [CreatedDate]            DATETIME         NOT NULL,
    [ModifiedBy]             VARCHAR (50)     NOT NULL,
    [ModifiedDate]           DATETIME         NOT NULL,
    [FileProcessingStatusId] INT              NULL,
    [Total]                  DECIMAL (18, 2)  NULL,
    CONSTRAINT [PK_BulkAllocationFile] PRIMARY KEY CLUSTERED ([BulkAllocationFileId] ASC)
);




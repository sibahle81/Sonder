CREATE TABLE [common].[UploadedFileProcessingStatus] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NULL,
    CONSTRAINT [PK_UploadedFileProcessingStatus] PRIMARY KEY CLUSTERED ([Id] ASC)
);


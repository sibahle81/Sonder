CREATE TABLE [commission].[PolicyImportError] (
    [id]          INT IDENTITY (1, 1) NOT NULL,
    [ImportBatch] INT NOT NULL,
    [rowid]       INT NOT NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
);


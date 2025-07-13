CREATE TABLE [commission].[PolicyStatus] (
    [StatusID] INT          IDENTITY (1, 1) NOT NULL,
    [Status]   VARCHAR (20) NOT NULL,
    PRIMARY KEY CLUSTERED ([StatusID] ASC)
);


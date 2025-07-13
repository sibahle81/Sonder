CREATE TABLE [commission].[ValidationType] (
    [ID]             INT          IDENTITY (1, 1) NOT NULL,
    [ValidationType] VARCHAR (20) NOT NULL,
    [STOREDPROC]     VARCHAR (30) NOT NULL,
    PRIMARY KEY CLUSTERED ([ID] ASC)
);


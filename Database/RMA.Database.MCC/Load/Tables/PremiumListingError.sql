CREATE TABLE [Load].[PremiumListingError] (
    [Id]             INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier] UNIQUEIDENTIFIER NOT NULL,
    [ErrorCategory]  VARCHAR (128)    NOT NULL,
    [ErrorMessage]   VARCHAR (256)    NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] DESC)
);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListing_FileIdentifier]
    ON [Load].[PremiumListingError]([FileIdentifier] ASC);
GO


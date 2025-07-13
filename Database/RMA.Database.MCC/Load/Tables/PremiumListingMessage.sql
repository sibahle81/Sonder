CREATE TABLE [Load].[PremiumListingMessage] (
    [FileIdentifier] UNIQUEIDENTIFIER NOT NULL,
    [Message]        VARCHAR (256)    NOT NULL,
    PRIMARY KEY CLUSTERED ([FileIdentifier] ASC)
);
GO


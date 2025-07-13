CREATE TABLE [Load].[MemberCancel] (
    [Id]                   INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]       UNIQUEIDENTIFIER NOT NULL,
    [UnderWritingYear]     VARCHAR (32)     NULL,
    [Product]              VARCHAR (32)     NULL,
    [MemberNo]             VARCHAR (256)    NULL,
    [MemberName]           VARCHAR (256)    NULL,
    [CancellationDate]     VARCHAR (32)     NULL,
    [CancellationReason]   VARCHAR (MAX)    NULL,
    [IndustryClass]        VARCHAR (32)     NULL,
    [ExcelRowNumber]       VARCHAR (50)     NULL,
    [IsExisting]           BIT              NULL,
    [UploadVersion]        INT              NULL,
    [UploadVersionCounter] INT              NULL,
    CONSTRAINT [PK__MemberCancel__3214EC07FA2ECE40] PRIMARY KEY CLUSTERED ([Id] ASC)
);


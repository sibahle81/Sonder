CREATE TABLE [Load].[ClientClass13Rates] (
    [Id]                      INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]          UNIQUEIDENTIFIER NOT NULL,
    [RefNo]                   VARCHAR (32)     NULL,
    [CompanyName]             VARCHAR (256)    NULL,
    [Industry]                VARCHAR (256)    NULL,
    [IndustryGroup]           VARCHAR (32)     NULL,
    [EmpCategory]             VARCHAR (32)     NULL,
    [IndRate]                 DECIMAL (10, 8)  NULL,
    [PremRate]                DECIMAL (10, 8)  NULL,
    [GPLimited]               DECIMAL (10, 8)  NULL,
    [FinalRate]               DECIMAL (10, 8)  NULL,
    [DiscountOrLoading]       DECIMAL (10, 8)  NULL,
    [DiscountOrLoadingStatus] VARCHAR (32)     NULL,
    [RatingYear]              VARCHAR (32)     NULL,
    [LoadDate]                DATETIME         NULL,
    [Product]                 VARCHAR (32)     NULL,
    [ExcelRowNumber]          VARCHAR (50)     NULL,
    [IsExisting]              BIT              CONSTRAINT [DF_ClientClass13Rates_IsExisting] DEFAULT ((0)) NULL,
    [UploadVersion]           INT              NULL,
    [UploadVersionCounter]    INT              NULL,
    CONSTRAINT [PK__ClientClass13Rates__3214EC07FA2ECE40] PRIMARY KEY CLUSTERED ([Id] ASC)
);


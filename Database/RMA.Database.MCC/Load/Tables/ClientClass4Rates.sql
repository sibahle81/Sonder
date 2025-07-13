CREATE TABLE [Load].[ClientClass4Rates] (
    [Id]                   INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]       UNIQUEIDENTIFIER NOT NULL,
    [Product]              VARCHAR (32)     NULL,
    [MemberNo]             VARCHAR (32)     NULL,
    [Category]             VARCHAR (200)    NULL,
    [BenefitSet]           VARCHAR (200)    NULL,
    [RateType]             VARCHAR (32)     NULL,
    [Rate]                 DECIMAL (10, 8)  NULL,
    [StartDate]            DATETIME         NULL,
    [EndDate]              DATETIME         NULL,
    [ExcelRowNumber]       VARCHAR (50)     NULL,
    [IsExisting]           BIT              CONSTRAINT [DF_ClientClass4Rates_IsExisting] DEFAULT ((0)) NULL,
    [UploadVersion]        INT              NULL,
    [UploadVersionCounter] INT              NULL,
    CONSTRAINT [PK__ClientClass4RatesClassIV__3214EC07FA2ECE40] PRIMARY KEY CLUSTERED ([Id] ASC)
);


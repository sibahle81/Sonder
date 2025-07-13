CREATE TABLE [Load].[IndustryRates] (
    [Id]                   INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]       UNIQUEIDENTIFIER NOT NULL,
    [Industry]             VARCHAR (50)     NOT NULL,
    [IndustryGroup]        VARCHAR (50)     NOT NULL,
    [EmployeeCategory]     VARCHAR (50)     NOT NULL,
    [IndustryRate]         DECIMAL (18, 4)  NOT NULL,
    [RatingYear]           INT              NOT NULL,
    [ExcelRowNumber]       VARCHAR (50)     NULL,
    [IsExisting]           BIT              NULL,
    [UploadVersion]        INT              NULL,
    [UploadVersionCounter] INT              NULL,
    CONSTRAINT [PK_IndustryRates] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'IndustryRates', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'IndustryRates';


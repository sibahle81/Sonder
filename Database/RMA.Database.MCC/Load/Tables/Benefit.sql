CREATE TABLE [Load].[Benefit] (
    [Id]                   INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]       UNIQUEIDENTIFIER NOT NULL,
    [BenefitName]          NVARCHAR (100)   NULL,
    [BenefitType]          VARCHAR (32)     NULL,
    [Product]              NVARCHAR (50)    NULL,
    [CoverMemberType]      NVARCHAR (50)    NULL,
    [StartDate]            DATETIME         NULL,
    [EndDate]              DATETIME         NULL,
    [MinCompensation]      DECIMAL (18, 2)  NULL,
    [MaxCompensation]      DECIMAL (18, 2)  NULL,
    [ExcessAmount]         DECIMAL (18, 2)  NULL,
    [ExcelRowNumber]       VARCHAR (50)     NULL,
    [Notes]                NVARCHAR (MAX)   NULL,
    [UploadVersion]        INT              NULL,
    [UploadVersionCounter] INT              NULL,
    CONSTRAINT [PK__Benefit__3214EC07FA2ECE40] PRIMARY KEY CLUSTERED ([Id] ASC)
);


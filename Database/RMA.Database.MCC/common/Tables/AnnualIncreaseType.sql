CREATE TABLE [common].[AnnualIncreaseType] (
    [Id]   INT           CONSTRAINT [DF_AnnualIncreaseType_Id] DEFAULT ((1)) NOT NULL,
    [Name] VARCHAR (255) NOT NULL,
    CONSTRAINT [PK_AnnualIncreaseType] PRIMARY KEY CLUSTERED ([Id] ASC)
);




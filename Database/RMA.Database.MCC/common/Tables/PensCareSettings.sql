CREATE TABLE [common].[PensCareSettings] (
    [Id]           INT            NOT NULL,
    [Key]          NVARCHAR (255) NOT NULL,
    [Value]        NVARCHAR (MAX) NOT NULL,
    [IsActive]     BIT            NOT NULL,
    [IsDeleted]    BIT            NOT NULL,
    [CreatedBy]    VARCHAR (50)   NOT NULL,
    [CreatedDate]  DATETIME       NOT NULL,
    [ModifiedBy]   VARCHAR (50)   NOT NULL,
    [ModifiedDate] DATETIME       NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [AK_common.PensCareSettings_Key] UNIQUE NONCLUSTERED ([Key] ASC)
);


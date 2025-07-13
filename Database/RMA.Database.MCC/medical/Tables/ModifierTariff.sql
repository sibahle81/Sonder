CREATE TABLE [medical].[ModifierTariff] (
    [Id]              INT          IDENTITY (1, 1) NOT NULL,
    [ModifierCode]    VARCHAR (20) NOT NULL,
    [TariffCode]      VARCHAR (20) NULL,
    [PublicationId]   INT          NULL,
    [SectionId]       INT          NULL,
    [Price]           MONEY        NULL,
    [IsIncludeTariff] TINYINT      NULL,
    [IsExcludeTariff] TINYINT      NULL,
    [IsActive]        BIT          DEFAULT ((1)) NOT NULL,
    [IsDeleted]       BIT          DEFAULT ((0)) NOT NULL,
    [CreatedBy]       VARCHAR (50) NOT NULL,
    [CreatedDate]     DATETIME     DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]      VARCHAR (50) NOT NULL,
    [ModifiedDate]    DATETIME     NOT NULL,
    CONSTRAINT [PK_medical_Modifiers] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_ModifierTariff_PublicationId] FOREIGN KEY ([PublicationId]) REFERENCES [medical].[Publication] ([PublicationId]),
    CONSTRAINT [FK_ModifierTariff_SectionId] FOREIGN KEY ([SectionId]) REFERENCES [medical].[Section] ([SectionId])
);


GO
ALTER TABLE [medical].[ModifierTariff] NOCHECK CONSTRAINT [FK_ModifierTariff_SectionId];


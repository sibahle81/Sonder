CREATE TABLE [product].[Template] (
    [TemplateId]            INT           IDENTITY (1, 1) NOT NULL,
    [Name]                  VARCHAR (50)  NOT NULL,
    [Description]           VARCHAR (255) NOT NULL,
    [TemplateContextTypeId] INT           NOT NULL,
    [TemplateHtml]          VARCHAR (MAX) NULL,
    [ReportTemplateUrl]     VARCHAR (255) NULL,
    CONSTRAINT [PK_Template] PRIMARY KEY CLUSTERED ([TemplateId] ASC),
    CONSTRAINT [FK_ContextType_Template] FOREIGN KEY ([TemplateContextTypeId]) REFERENCES [common].[TemplateContextType] ([Id])
);


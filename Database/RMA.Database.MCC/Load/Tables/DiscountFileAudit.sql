CREATE TABLE [Load].[DiscountFileAudit] (
    [Id]                   INT           IDENTITY (1, 1) NOT NULL,
    [FileHash]             VARCHAR (255) NULL,
    [FileName]             VARCHAR (255) NOT NULL,
    [DiscountFileStatusId] INT           NULL,
    [IsDeleted]            BIT           NOT NULL,
    [CreatedBy]            VARCHAR (50)  NOT NULL,
    [CreatedDate]          DATETIME      NOT NULL,
    [ModifiedBy]           VARCHAR (50)  NOT NULL,
    [ModifiedDate]         DATETIME      NOT NULL,
    CONSTRAINT [PK__DiscountFileAudit] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_DiscountFileAudit_DiscountFileStatus] FOREIGN KEY ([DiscountFileStatusId]) REFERENCES [common].[DiscountFileStatus] ([Id])
);


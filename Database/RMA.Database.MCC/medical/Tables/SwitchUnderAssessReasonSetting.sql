CREATE TABLE [medical].[SwitchUnderAssessReasonSetting] (
    [Id]                 INT            NOT NULL,
    [Code]               VARCHAR (200)  NULL,
    [Name]               VARCHAR (2048) NULL,
    [InvoiceTypeId]      INT            NOT NULL,
    [InvoiceStatusId]    INT            NOT NULL,
    [IsAutoCanReinstate] BIT            NULL,
    [Action]             VARCHAR (100)  NULL,
    [IsLineItemReason]   BIT            NULL,
    [IsAutoValidation]   BIT            NULL,
    [IsActive]           BIT            NOT NULL,
    [IsDeleted]          BIT            NOT NULL,
    [CreatedBy]          VARCHAR (50)   NOT NULL,
    [CreatedDate]        DATETIME       NOT NULL,
    [ModifiedBy]         VARCHAR (50)   NOT NULL,
    [ModifiedDate]       DATETIME       NOT NULL,
    CONSTRAINT [PK_medical_SwitchUnderAssessReasonSetting_Id] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_SwitchUnderAssessReason_SwitchUnderAssessReasonSetting_Id] FOREIGN KEY ([Id]) REFERENCES [common].[SwitchUnderAssessReason] ([Id])
);


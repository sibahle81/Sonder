CREATE TABLE [medical].[PreAuthorisationUnderAssessReason] (
    [Id]                  INT            IDENTITY (1, 1) NOT NULL,
    [PreAuthId]           INT            NOT NULL,
    [UnderAssessReasonId] INT            NOT NULL,
    [UnderAssessReason]   VARCHAR (2048) NULL,
    [Comments]            VARCHAR (2048) NULL,
    [IsActive]            BIT            NOT NULL,
    [IsDeleted]           BIT            CONSTRAINT [DF_PreAuthorisationUnderAssessReason_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]           VARCHAR (50)   NOT NULL,
    [CreatedDate]         DATETIME       CONSTRAINT [DF_PreAuthorisationUnderAssessReason_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]          VARCHAR (50)   NOT NULL,
    [ModifiedDate]        DATETIME       CONSTRAINT [DF_PreAuthorisationUnderAssessReason_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_medical_PreAuthorisationUnderAssessReason_Id] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_medical_PreAuthorisationUnderAssessReason_PreAuthorisation] FOREIGN KEY ([PreAuthId]) REFERENCES [medical].[PreAuthorisation] ([PreAuthId]),
    CONSTRAINT [FK_PreAuthorisationUnderAssessReason_PreAuthRejectReason] FOREIGN KEY ([UnderAssessReasonId]) REFERENCES [medical].[PreAuthRejectReason] ([Id])
);


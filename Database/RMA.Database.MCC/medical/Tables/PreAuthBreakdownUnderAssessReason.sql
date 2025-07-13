CREATE TABLE [medical].[PreAuthBreakdownUnderAssessReason] (
    [Id]                  INT            IDENTITY (1, 1) NOT NULL,
    [PreAuthBreakdownId]  INT            NOT NULL,
    [UnderAssessReasonId] INT            NOT NULL,
    [UnderAssessReason]   VARCHAR (2048) NULL,
    [Comments]            VARCHAR (2048) NULL,
    [IsActive]            BIT            NOT NULL,
    [IsDeleted]           BIT            CONSTRAINT [DF_PreAuthBreakdownUnderAssessReason_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]           VARCHAR (50)   NOT NULL,
    [CreatedDate]         DATETIME       CONSTRAINT [DF_PreAuthBreakdownUnderAssessReason_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]          VARCHAR (50)   NOT NULL,
    [ModifiedDate]        DATETIME       CONSTRAINT [DF_PreAuthBreakdownUnderAssessReason_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_medical_PreAuthBreakdownUnderAssessReason_Id] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_medical_PreAuthBreakdownUnderAssessReason_PreAuthorisationBreakdown] FOREIGN KEY ([PreAuthBreakdownId]) REFERENCES [medical].[PreAuthorisationBreakdown] ([PreAuthBreakdownId]),
    CONSTRAINT [FK_PreAuthBreakdownUnderAssessReason_PreAuthRejectReason_UnderAssessReasonId] FOREIGN KEY ([UnderAssessReasonId]) REFERENCES [medical].[PreAuthRejectReason] ([Id])
);


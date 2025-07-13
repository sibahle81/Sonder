CREATE TABLE [claim].[HearingAssessment] (
    [HearingAssessmentId]     INT             IDENTITY (1, 1) NOT NULL,
    [RoleplayerId]            INT             NOT NULL,
    [AssessmentDate]          DATETIME        NOT NULL,
    [AssessedByUserId]        INT             NOT NULL,
    [AssessedByName]          VARCHAR (50)    NULL,
    [Description]             VARCHAR (150)   NOT NULL,
    [HearingAssessmentTypeId] INT             NOT NULL,
    [SundryServiceProviderId] INT             NULL,
    [PercentageHL]            DECIMAL (10, 2) NULL,
    [AwardedPHL]              DECIMAL (10, 2) NULL,
    [IsUsed]                  BIT             CONSTRAINT [DF_HearingAssessment_IsUsed] DEFAULT ((0)) NOT NULL,
    [CalcOperands]            VARCHAR (250)   NULL,
    [AudiogramNumber]         INT             NULL,
    [CreatedBy]               VARCHAR (50)    NOT NULL,
    [CreatedDate]             DATETIME        NOT NULL,
    [ModifiedBy]              VARCHAR (50)    NOT NULL,
    [ModifiedDate]            DATETIME        NOT NULL,
    CONSTRAINT [PK_HearingAssessment] PRIMARY KEY CLUSTERED ([HearingAssessmentId] ASC),
    CONSTRAINT [FK_HearingAssessment_HearingAssessmentType] FOREIGN KEY ([HearingAssessmentTypeId]) REFERENCES [claim].[HearingAssessmentType] ([HearingAssessmentTypeId]),
    CONSTRAINT [FK_HearingAssessment_RolePlayer] FOREIGN KEY ([RoleplayerId]) REFERENCES [client].[RolePlayer] ([RolePlayerId])
);


CREATE TABLE [claim].[AudioGramItem] (
    [AudioGramItemId]     INT             IDENTITY (1, 1) NOT NULL,
    [HearingAssessmentId] INT             NOT NULL,
    [Frequency]           DECIMAL (10, 2) NULL,
    [DBLossLeftEar]       DECIMAL (10, 2) NULL,
    [DBLossRightEar]      DECIMAL (10, 2) NULL,
    [PercentageHL]        DECIMAL (10, 2) NULL,
    [CreatedBy]           VARCHAR (50)    NOT NULL,
    [CreatedDate]         DATETIME        NOT NULL,
    [ModifiedBy]          VARCHAR (50)    NOT NULL,
    [ModifiedDate]        DATETIME        NOT NULL,
    CONSTRAINT [PK_AudioGramItem] PRIMARY KEY CLUSTERED ([AudioGramItemId] ASC),
    CONSTRAINT [FK_AudioGramItem_HearingAssessment] FOREIGN KEY ([HearingAssessmentId]) REFERENCES [claim].[HearingAssessment] ([HearingAssessmentId])
);


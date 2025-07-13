CREATE TABLE [claim].[ClaimDisabilityAssessment] (
    [ClaimDisabilityAssessmentId]  INT             IDENTITY (1, 1) NOT NULL,
    [PersonEventId]                INT             NOT NULL,
    [FinalDiagnosis]               VARCHAR (250)   NOT NULL,
    [RawPdPercentage]              DECIMAL (10, 2) NOT NULL,
    [NettAssessedPdPercentage]     DECIMAL (10, 2) NOT NULL,
    [AssessedBy]                   INT             NOT NULL,
    [AssessmentDate]               DATETIME        NOT NULL,
    [IsDeleted]                    BIT             NOT NULL,
    [CreatedBy]                    VARCHAR (50)    NOT NULL,
    [CreatedDate]                  DATETIME        NOT NULL,
    [ModifiedBy]                   VARCHAR (50)    NULL,
    [ModifiedDate]                 DATETIME        NOT NULL,
    [DisabilityAssessmentStatusId] INT             NULL,
    CONSTRAINT [PK_ClaimDisabilityAssessment] PRIMARY KEY CLUSTERED ([ClaimDisabilityAssessmentId] ASC),
    CONSTRAINT [FK_ClaimDisabilityAssessment_PersonEvent] FOREIGN KEY ([PersonEventId]) REFERENCES [claim].[PersonEvent] ([PersonEventId])
);


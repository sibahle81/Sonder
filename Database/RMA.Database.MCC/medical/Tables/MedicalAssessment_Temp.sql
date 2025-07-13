CREATE TABLE [medical].[MedicalAssessment_Temp] (
    [MedicalAssessmentID] INT                                                  IDENTITY (1, 1) NOT NULL,
    [ClaimID]             INT                                                  NOT NULL,
    [AssessedPD]          DECIMAL (18) MASKED WITH (FUNCTION = 'default()')    NOT NULL,
    [MedicalReportID]     INT                                                  NULL,
    [FinalDiagnosis]      NVARCHAR (2048) MASKED WITH (FUNCTION = 'default()') NULL,
    [AssessedByName]      NVARCHAR (50) MASKED WITH (FUNCTION = 'default()')   NULL,
    [AssessedByUser]      INT                                                  NULL,
    [AssessmentDate]      DATETIME                                             NOT NULL,
    [IsAuthorised]        BIT                                                  NOT NULL,
    [AuthorisedUserID]    INT                                                  NULL,
    [RawPD]               DECIMAL (18)                                         NOT NULL,
    [HearingAssessmentID] INT                                                  NULL,
    [AssessmentCentre]    NVARCHAR (50)                                        NULL,
    [AssessmentLevelID]   INT                                                  NULL,
    [PersonEventID]       INT                                                  NULL,
    [LastChangedBy]       VARCHAR (30)                                         NULL,
    [LastChangedDate]     DATETIME                                             NULL,
    [IsRawPD]             BIT                                                  NULL,
    [RawPDAcceptedBy]     VARCHAR (30)                                         NULL,
    [IsActive]            BIT                                                  NOT NULL,
    [IsDeleted]           BIT                                                  NOT NULL,
    [CreatedBy]           VARCHAR (50)                                         NOT NULL,
    [CreatedDate]         DATETIME                                             NOT NULL,
    [ModifiedBy]          VARCHAR (50)                                         NOT NULL,
    [ModifiedDate]        DATETIME                                             NOT NULL,
    CONSTRAINT [PK_Compensation_MedicalAssessment_MedicalAssessmentID] PRIMARY KEY CLUSTERED ([MedicalAssessmentID] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_Medical_MedicalAssessment_ClaimID] FOREIGN KEY ([ClaimID]) REFERENCES [claim].[Claim] ([ClaimId]),
    CONSTRAINT [FK_Medical_MedicalAssessment_HearingAssessmentID] FOREIGN KEY ([HearingAssessmentID]) REFERENCES [claim].[HearingAssessment] ([HearingAssessmentId]),
    CONSTRAINT [FK_MedicalAssessment_MedicalReport_MedicalReportID] FOREIGN KEY ([MedicalReportID]) REFERENCES [claim].[MedicalReport] ([MedicalReportId])
);


GO
ALTER TABLE [medical].[MedicalAssessment_Temp] NOCHECK CONSTRAINT [FK_Medical_MedicalAssessment_ClaimID];


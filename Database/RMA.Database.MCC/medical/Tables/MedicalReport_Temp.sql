CREATE TABLE [medical].[MedicalReport_Temp] (
    [MedicalReportID]          INT                                                  IDENTITY (1, 1) NOT NULL,
    [PersonEventID]            INT                                                  NOT NULL,
    [ReportDate]               DATETIME                                             NOT NULL,
    [MedicalReportTypeID]      INT                                                  NOT NULL,
    [FirstConsultationDate]    DATETIME                                             NULL,
    [IsStabilised]             BIT                                                  NULL,
    [StabilisedDate]           DATETIME                                             NULL,
    [NotStabilisedReason]      NVARCHAR (512)                                       NULL,
    [ClinicalDescription]      NVARCHAR (2048) MASKED WITH (FUNCTION = 'default()') NULL,
    [IsInjuryConsistent]       BIT                                                  NULL,
    [IsContributingCauses]     BIT                                                  NULL,
    [ContributingDescription]  NVARCHAR (512) MASKED WITH (FUNCTION = 'default()')  NULL,
    [IsPreExistingDefect]      BIT                                                  NULL,
    [PreExistingDescription]   NVARCHAR (512)                                       NULL,
    [IsUnfitForWork]           BIT                                                  NOT NULL,
    [IsUnfitForWorkAuth]       BIT                                                  NOT NULL,
    [FirstDayOff]              DATETIME                                             NULL,
    [EstimatedDaysOff]         DECIMAL (18)                                         NOT NULL,
    [LastDayOff]               DATETIME                                             NULL,
    [ReferralHistory]          NVARCHAR (512) MASKED WITH (FUNCTION = 'default()')  NULL,
    [RadiologicalExaminations] NVARCHAR (512) MASKED WITH (FUNCTION = 'default()')  NULL,
    [OperationsProcedures]     NVARCHAR (512)                                       NULL,
    [PhysiotherapyDetails]     NVARCHAR (512)                                       NULL,
    [IsRefusedCompensation]    BIT                                                  NULL,
    [DetailedImpairmentEval]   NVARCHAR (2048) MASKED WITH (FUNCTION = 'default()') NULL,
    [MedicalServiceProviderID] INT                                                  NULL,
    [PatientNumber]            NVARCHAR (50) MASKED WITH (FUNCTION = 'default()')   NULL,
    [DateAssurerNotified]      DATETIME                                             NULL,
    [MedicalReportCategoryID]  INT                                                  NOT NULL,
    [MedicalReportCategoryXML] NVARCHAR (MAX)                                       NULL,
    [LastChangedBy]            VARCHAR (30)                                         NULL,
    [LastChangedDate]          DATETIME                                             NULL,
    [ReportStatus]             TINYINT                                              DEFAULT ((2)) NULL,
    [IsRejected]               BIT                                                  CONSTRAINT [DF_MedicalReport_IsRejected] DEFAULT ((0)) NULL,
    [MemberUserID]             INT                                                  NULL,
    [RejectionWorkflowID]      INT                                                  CONSTRAINT [DF_MedicalReport_RejectionWorkflowID] DEFAULT ((0)) NULL,
    [RejectionReason]          VARCHAR (2048)                                       NULL,
    [AssessmentTypeId]         INT                                                  NULL,
    [WorkflowNotificationID]   INT                                                  NULL,
    [TreatmentDate]            DATETIME MASKED WITH (FUNCTION = 'default()')        NULL,
    [ICD10Codes]               VARCHAR (255)                                        NULL,
    [RejectPendReasonID]       INT                                                  NULL,
    [IsActive]                 BIT                                                  NOT NULL,
    [IsDeleted]                BIT                                                  NOT NULL,
    [CreatedBy]                VARCHAR (50)                                         NOT NULL,
    [CreatedDate]              DATETIME                                             NOT NULL,
    [ModifiedBy]               VARCHAR (50)                                         NOT NULL,
    [ModifiedDate]             DATETIME                                             NOT NULL,
    CONSTRAINT [PK_Compensation_MedicalReport_MedicalReportID] PRIMARY KEY CLUSTERED ([MedicalReportID] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_Medical_MedicalReport_MedicalReportCategoryID] FOREIGN KEY ([MedicalReportCategoryID]) REFERENCES [digi].[MedicalReportCategory] ([MedicalReportCategoryId]),
    CONSTRAINT [FK_Medical_MedicalReport_MedicalServiceProviderID] FOREIGN KEY ([MedicalServiceProviderID]) REFERENCES [medical].[HealthCareProvider] ([RolePlayerId]),
    CONSTRAINT [FK_Medical_MedicalReport_PersonEventID] FOREIGN KEY ([PersonEventID]) REFERENCES [claim].[PersonEvent] ([PersonEventId])
);


GO
ALTER TABLE [medical].[MedicalReport_Temp] NOCHECK CONSTRAINT [FK_Medical_MedicalReport_MedicalServiceProviderID];


GO
ALTER TABLE [medical].[MedicalReport_Temp] NOCHECK CONSTRAINT [FK_Medical_MedicalReport_PersonEventID];


CREATE TABLE [claim].[MedicalReport](
	[MedicalReportId] [int] NOT NULL,
	[PersonEventId] [int] NOT NULL,
	[PersonId] [int] NOT NULL,
	[ReportDate] [datetime] NOT NULL,
	[MedicalReportTypeId] [int] NOT NULL,
	[FirstConsultationDate] [datetime] NULL,
	[IsStabilised] [bit] NOT NULL,
	[StabilisedDate] [date] NULL,
	[NotStabilisedReason] [varchar](1024) NULL,
	[ClinicalDescription] [varchar](2048) NULL,
	[IsInjuryConsistent] [bit] NOT NULL,
	[IsContributingCauses] [bit] NOT NULL,
	[ContributingDescription] [varchar](2048) NULL,
	[IsPreExistingDefect] [bit] NOT NULL,
	[PreExistingDefectDescription] [varchar](2048) NULL,
	[IsUnfitForWork] [bit] NOT NULL,
	[IsUnfitForWorkAuth] [bit] NOT NULL,
	[FirstDayOff] [date] NULL,
	[EstimatedDaysOff] [decimal](3, 0) NULL,
	[LastDayOff] [date] NULL,
	[ReferralHistory] [varchar](255) NULL,
	[RadiologicalExaminations] [varchar](255) NULL,
	[OperationsProcedures] [varchar](255) NULL,
	[PhysioTherapyDetails] [varchar](255) NULL,
	[IsRefusedCompensation] [bit] NOT NULL,
	[DetailedImpairmentEval] [varchar](255) NULL,
	[MedicalServiceProviderId] [int] NULL,
	[PatientNumber] [varchar](50) NULL,
	[DateAssurerNotified] [date] NULL,
	[MedicalReportCategoryId] [int] NOT NULL,
	[MedicalReportCategoryXml] [xml] NULL,
	[IsActive] [bit] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_MedicalReport] PRIMARY KEY CLUSTERED 
(
	[MedicalReportId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [claim].[MedicalReport]  WITH CHECK ADD  CONSTRAINT [FK_MedicalReport_MedicalReportType] FOREIGN KEY([MedicalReportTypeId])
REFERENCES [common].[MedicalReportType] ([Id])
GO
ALTER TABLE [claim].[MedicalReport] CHECK CONSTRAINT [FK_MedicalReport_MedicalReportType]
GO

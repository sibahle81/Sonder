CREATE TABLE [claim].[HearingAssessmentType] (
    [HearingAssessmentTypeId] INT            IDENTITY (1, 1) NOT NULL,
    [Name]                    VARCHAR (50)   NOT NULL,
    [Description]             VARCHAR (2048) NULL,
    [CreatedBy]               VARCHAR (50)   NOT NULL,
    [CreatedDate]             DATETIME       NOT NULL,
    [ModifiedBy]              VARCHAR (50)   NOT NULL,
    [ModifiedDate]            DATETIME       NOT NULL,
    CONSTRAINT [PK_HearingAssessmentType] PRIMARY KEY CLUSTERED ([HearingAssessmentTypeId] ASC)
);


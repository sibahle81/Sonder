CREATE TABLE [medical].[MedicalReportType_Temp] (
    [MedicalReportTypeId] INT            IDENTITY (1, 1) NOT NULL,
    [Name]                VARCHAR (50)   NOT NULL,
    [Description]         VARCHAR (2048) NULL,
    [IsActive]            BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]           BIT            DEFAULT ((0)) NOT NULL,
    [CreatedBy]           VARCHAR (50)   NOT NULL,
    [CreatedDate]         DATETIME       DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]          VARCHAR (50)   NOT NULL,
    [ModifiedDate]        DATETIME       NOT NULL,
    CONSTRAINT [PK_medical_MedicalReportType] PRIMARY KEY CLUSTERED ([MedicalReportTypeId] ASC) WITH (FILLFACTOR = 95)
);


CREATE TABLE [medical].[TreatmentStatus_Temp] (
    [TreatmentStatusID] INT           IDENTITY (1, 1) NOT NULL,
    [Name]              VARCHAR (50)  NOT NULL,
    [Description]       VARCHAR (200) NULL,
    [IsActive]          BIT           NOT NULL,
    [IsDeleted]         BIT           NOT NULL,
    [CreatedBy]         VARCHAR (50)  NOT NULL,
    [CreatedDate]       DATETIME      NOT NULL,
    [ModifiedBy]        VARCHAR (50)  NOT NULL,
    [ModifiedDate]      DATETIME      NOT NULL,
    CONSTRAINT [PK_Compensation_TreatmentStatus_TreatmentStatusID] PRIMARY KEY CLUSTERED ([TreatmentStatusID] ASC) WITH (FILLFACTOR = 95)
);


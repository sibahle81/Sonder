CREATE TABLE [medical].[MedicalBenefitGroup_Temp] (
    [MedicalBenefitGroupID] INT             IDENTITY (1, 1) NOT NULL,
    [Name]                  NVARCHAR (50)   NOT NULL,
    [Description]           NVARCHAR (2048) NULL,
    [LastChangedBy]         VARCHAR (30)    NULL,
    [LastChangedDate]       DATETIME        NULL,
    [IsActive]              BIT             NOT NULL,
    [IsDeleted]             BIT             NOT NULL,
    [CreatedBy]             VARCHAR (50)    NOT NULL,
    [CreatedDate]           DATETIME        NOT NULL,
    [ModifiedBy]            VARCHAR (50)    NOT NULL,
    [ModifiedDate]          DATETIME        NOT NULL,
    CONSTRAINT [PK_Compensation_MedicalBenefitGroup_MedicalBenefitGroupID] PRIMARY KEY CLUSTERED ([MedicalBenefitGroupID] ASC) WITH (FILLFACTOR = 95)
);


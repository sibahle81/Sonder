CREATE TABLE [medical].[TreatmentEstLocLos_Temp] (
    [EstLocLosId]     INT             IDENTITY (1, 1) NOT NULL,
    [TreatmentCodeId] INT             NOT NULL,
    [Icd10CodeId]     INT             NOT NULL,
    [LevelOfCareId]   INT             NOT NULL,
    [EstValue]        DECIMAL (18, 2) DEFAULT ((0)) NOT NULL,
    [IsActive]        BIT             NOT NULL,
    [IsDeleted]       BIT             NOT NULL,
    [CreatedBy]       VARCHAR (50)    NOT NULL,
    [CreatedDate]     DATETIME        NOT NULL,
    [ModifiedBy]      VARCHAR (50)    NOT NULL,
    [ModifiedDate]    DATETIME        NOT NULL,
    PRIMARY KEY CLUSTERED ([EstLocLosId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);


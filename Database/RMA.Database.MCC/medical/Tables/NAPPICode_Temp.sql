CREATE TABLE [medical].[NAPPICode_Temp] (
    [NAPPICodeId]      INT             IDENTITY (1, 1) NOT NULL,
    [NAPPICode]        VARCHAR (50)    NOT NULL,
    [ProductName]      VARCHAR (50)    NOT NULL,
    [ProductStrength]  VARCHAR (50)    NOT NULL,
    [DosageForm]       VARCHAR (12)    NOT NULL,
    [ProductPackSize]  DECIMAL (10, 2) NOT NULL,
    [ManufacturerCode] VARCHAR (12)    NOT NULL,
    [Schedule]         VARCHAR (12)    NOT NULL,
    [IsActive]         BIT             DEFAULT ((1)) NOT NULL,
    [IsDeleted]        BIT             DEFAULT ((0)) NOT NULL,
    [CreatedBy]        VARCHAR (50)    NOT NULL,
    [CreatedDate]      DATETIME        DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]       VARCHAR (50)    NOT NULL,
    [ModifiedDate]     DATETIME        NOT NULL,
    CONSTRAINT [PK_medical_NAPPICode] PRIMARY KEY CLUSTERED ([NAPPICodeId] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [UK_medical_NAPPICode_NAPPICode] UNIQUE NONCLUSTERED ([NAPPICode] ASC) WITH (FILLFACTOR = 95)
);


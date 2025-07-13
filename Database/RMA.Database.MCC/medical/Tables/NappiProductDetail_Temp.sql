CREATE TABLE [medical].[NappiProductDetail_Temp] (
    [NappiCode]        VARCHAR (50)   NOT NULL,
    [ProductName]      VARCHAR (50)   NOT NULL,
    [ProductStrength]  VARCHAR (50)   NULL,
    [DosageForm]       VARCHAR (12)   NOT NULL,
    [ManufacturerCode] VARCHAR (12)   NOT NULL,
    [IsProceed]        BIT            NULL,
    [ErrorDesc]        VARCHAR (1000) NULL,
    [IsActive]         BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]        BIT            DEFAULT ((0)) NOT NULL,
    [CreatedBy]        VARCHAR (50)   NOT NULL,
    [CreatedDate]      DATETIME       DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]       VARCHAR (50)   NOT NULL,
    [ModifiedDate]     DATETIME       NOT NULL
);


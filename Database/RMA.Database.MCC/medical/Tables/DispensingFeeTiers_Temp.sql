CREATE TABLE [medical].[DispensingFeeTiers_Temp] (
    [DFTID]                 INT            IDENTITY (1, 1) NOT NULL,
    [SEPRangeLowerLimit]    MONEY          NOT NULL,
    [SEPRangeUpperLimit]    MONEY          NOT NULL,
    [DispensingPercentage]  DECIMAL (5, 2) NOT NULL,
    [DispensingAdditionAmt] MONEY          NOT NULL,
    [VaildFrom]             DATETIME       NOT NULL,
    [ValidTo]               DATETIME       NOT NULL,
    [LastChangedBy]         VARCHAR (30)   NULL,
    [LastChangedDate]       DATETIME       NULL,
    [IsActive]              BIT            NOT NULL,
    [IsDeleted]             BIT            NOT NULL,
    [CreatedBy]             VARCHAR (50)   NOT NULL,
    [CreatedDate]           DATETIME       NOT NULL,
    [ModifiedBy]            VARCHAR (50)   NOT NULL,
    [ModifiedDate]          DATETIME       NOT NULL,
    CONSTRAINT [PK_DispensingFeeTiers_DFTID] PRIMARY KEY CLUSTERED ([DFTID] ASC) WITH (FILLFACTOR = 95)
);


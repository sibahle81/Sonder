CREATE TABLE [medical].[TreatmentBasketMap_Temp] (
    [TreatmentBasketMapID] INT          IDENTITY (1, 1) NOT NULL,
    [TreatmentBasketID]    INT          NOT NULL,
    [ICD10CodeID]          INT          NOT NULL,
    [PractitionerTypeID]   INT          NOT NULL,
    [TreatmentCodeID]      INT          NULL,
    [MedicalItemID]        INT          NULL,
    [IsActive]             BIT          NOT NULL,
    [IsDeleted]            BIT          NOT NULL,
    [CreatedBy]            VARCHAR (50) NOT NULL,
    [CreatedDate]          DATETIME     NOT NULL,
    [ModifiedBy]           VARCHAR (50) NOT NULL,
    [ModifiedDate]         DATETIME     NOT NULL,
    CONSTRAINT [PK_Medical_TreatmentBasketMap_TreatmentBasketMapID] PRIMARY KEY CLUSTERED ([TreatmentBasketMapID] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_TreatmentBasketMap_Temp_TreatmentBasket] FOREIGN KEY ([TreatmentBasketID]) REFERENCES [medical].[TreatmentBasket] ([TreatmentBasketId])
);


﻿CREATE TABLE [medical].[ChronicMedicationForm_Temp] (
    [ChronicMedicationFormId]  INT            IDENTITY (1, 1) NOT NULL,
    [ClaimId]                  INT            NOT NULL,
    [IsSignedByApplicant]      BIT            NULL,
    [Height]                   DECIMAL (5, 2) NULL,
    [Weight]                   DECIMAL (5, 2) NULL,
    [BloodPressure]            VARCHAR (6)    NOT NULL,
    [Urine]                    VARCHAR (50)   NULL,
    [Allergies]                VARCHAR (50)   NULL,
    [HIVStatus]                VARCHAR (50)   NULL,
    [Description]              VARCHAR (2048) NULL,
    [DateFormFilled]           DATETIME       NULL,
    [DateSubmitted]            DATETIME       NULL,
    [DateConsulted]            DATETIME       NULL,
    [MedicalServiceProviderId] INT            NULL,
    [IsActive]                 BIT            NOT NULL,
    [DeliveryMethod]           TINYINT        NULL,
    [Hobbies]                  VARCHAR (50)   NULL,
    [PreAuthId]                INT            NULL,
    [DeliveryAddress]          VARCHAR (1000) NULL,
    [IsSignedByHCP]            BIT            NULL,
    [DateSignedByHCP]          DATETIME       NULL,
    [IsDeleted]                BIT            NOT NULL,
    [CreatedBy]                VARCHAR (50)   NOT NULL,
    [CreatedDate]              DATETIME       NOT NULL,
    [ModifiedBy]               VARCHAR (50)   NOT NULL,
    [ModifiedDate]             DATETIME       NOT NULL,
    CONSTRAINT [PK_ChronicMedicationForm_Temp] PRIMARY KEY CLUSTERED ([ChronicMedicationFormId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);


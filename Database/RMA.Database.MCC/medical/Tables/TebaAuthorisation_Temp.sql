﻿CREATE TABLE [medical].[TebaAuthorisation_Temp] (
    [TebaAuthID]               INT           IDENTITY (1, 1) NOT NULL,
    [PersonEventID]            INT           NOT NULL,
    [MedicalServiceProviderID] INT           NOT NULL,
    [DateAuthorisedFrom]       DATETIME      NOT NULL,
    [DateAuthorisedTo]         DATETIME      NOT NULL,
    [PreAuthNumber]            VARCHAR (50)  NOT NULL,
    [Description]              VARCHAR (200) NULL,
    [DateCaptured]             DATETIME      NOT NULL,
    [InvoicerTypeID]           INT           NOT NULL,
    [InvoicerID]               INT           NOT NULL,
    [IsPreAuthorisation]       BIT           NOT NULL,
    [IsBulkAuthorisation]      BIT           NOT NULL,
    [IsMedicalVisa]            BIT           NOT NULL,
    [DateOfVisa]               DATETIME      NULL,
    [TebaOffcial]              VARCHAR (50)  NULL,
    [TebaOffcialDate]          DATETIME      NULL,
    [PMPRegionID]              INT           NULL,
    [ReturnDate]               DATETIME      NULL,
    [ClinicBookingID]          INT           NULL,
    [IsTravelAuth]             BIT           DEFAULT ((0)) NULL,
    [ReturnComments]           VARCHAR (200) NULL,
    [IsActive]                 BIT           NOT NULL,
    [IsDeleted]                BIT           NOT NULL,
    [CreatedBy]                VARCHAR (50)  NOT NULL,
    [CreatedDate]              DATETIME      NOT NULL,
    [ModifiedBy]               VARCHAR (50)  NOT NULL,
    [ModifiedDate]             DATETIME      NOT NULL,
    CONSTRAINT [PK_Medical_TebaAuthorisation_TebaAuthID] PRIMARY KEY CLUSTERED ([TebaAuthID] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_TebaAuthorisation_Temp_HealthCareProvider] FOREIGN KEY ([MedicalServiceProviderID]) REFERENCES [medical].[HealthCareProvider] ([RolePlayerId]),
    CONSTRAINT [FK_TebaAuthorisation_Temp_Invoice] FOREIGN KEY ([InvoicerID]) REFERENCES [medical].[Invoice] ([InvoiceId])
);


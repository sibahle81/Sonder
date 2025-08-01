﻿CREATE TABLE [pension].[COLDetails] (
    [ColDetailsID]             INT          IDENTITY (1, 1) NOT NULL,
    [IndividualID]             INT          NULL,
    [ReceivedCOLDate]          DATETIME     NULL,
    [ReceivedFingerprintsDate] DATETIME     NULL,
    [SubmittedDate]            DATETIME     NULL,
    [ReceiveMethodID]          INT          NULL,
    [ReceiveTypeID]            INT          NULL,
    [ReceivedFromID]           INT          NULL,
    [COLReasonID]              INT          NOT NULL,
    [Fingerprints]             INT          NULL,
    [IsActive]                 BIT          DEFAULT ((1)) NOT NULL,
    [IsDeleted]                BIT          NOT NULL,
    [CreatedBy]                VARCHAR (50) NOT NULL,
    [CreatedDate]              DATETIME     NOT NULL,
    [ModifiedBy]               VARCHAR (50) NOT NULL,
    [ModifiedDate]             DATETIME     NOT NULL,
    CONSTRAINT [PK_Pension_COLDetails_ColDetailsID] PRIMARY KEY CLUSTERED ([ColDetailsID] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_COLDetails_COLReceivedFrom] FOREIGN KEY ([ReceivedFromID]) REFERENCES [common].[COLReceivedFrom] ([Id]),
    CONSTRAINT [FK_COLDetails_COLReceiveMethod] FOREIGN KEY ([ReceiveMethodID]) REFERENCES [common].[COLReceiveMethod] ([Id]),
    CONSTRAINT [FK_COLDetails_COLReceiveType] FOREIGN KEY ([ReceiveTypeID]) REFERENCES [common].[COLReceiveType] ([Id]),
    CONSTRAINT [FK_COLDetails_Individual] FOREIGN KEY ([IndividualID]) REFERENCES [pension].[Individual] ([IndividualId]),
    CONSTRAINT [FK_COLDetails_TebaStatus] FOREIGN KEY ([COLReasonID]) REFERENCES [common].[TebaStatus] ([Id])
);


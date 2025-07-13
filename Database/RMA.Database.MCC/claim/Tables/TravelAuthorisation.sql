CREATE TABLE [claim].[TravelAuthorisation] (
    [TravelAuthorisationId]   INT             IDENTITY (1, 1) NOT NULL,
    [PersonEventId]           INT             NOT NULL,
    [TravelAuthorisedPartyId] INT             NULL,
    [DateAuthorisedFrom]      DATETIME        NOT NULL,
    [DateAuthorisedTo]        DATETIME        NOT NULL,
    [AuthorisedKm]            DECIMAL (7, 2)  NOT NULL,
    [TravelRateTypeId]        INT             NOT NULL,
    [AuthorisedRate]          DECIMAL (7, 2)  NOT NULL,
    [AuthorisedAmount]        DECIMAL (10, 2) NULL,
    [Description]             VARCHAR (MAX)   NOT NULL,
    [IsPreAuthorised]         BIT             CONSTRAINT [DF_TravelAuthorisation_IsPreAuthorised] DEFAULT ((0)) NOT NULL,
    [IsDeleted]               BIT             NOT NULL,
    [CreatedBy]               VARCHAR (50)    NOT NULL,
    [CreatedDate]             DATETIME        NOT NULL,
    [ModifiedBy]              VARCHAR (50)    NOT NULL,
    [ModifiedDate]            DATETIME        NOT NULL,
    CONSTRAINT [PK_TravelAuthorisation] PRIMARY KEY CLUSTERED ([TravelAuthorisationId] ASC),
    CONSTRAINT [FK_TravelAuthorisation_PersonEvent] FOREIGN KEY ([PersonEventId]) REFERENCES [claim].[PersonEvent] ([PersonEventId]),
    CONSTRAINT [FK_TravelAuthorisation_TravelAuthorisedParty] FOREIGN KEY ([TravelAuthorisedPartyId]) REFERENCES [claim].[TravelAuthorisedParty] ([TravelAuthorisedPartyId]),
    CONSTRAINT [FK_TravelAuthorisation_TravelRateType] FOREIGN KEY ([TravelRateTypeId]) REFERENCES [claim].[TravelRateType] ([TravelRateTypeId])
);


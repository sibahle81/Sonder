CREATE TABLE [claim].[InjuryEstimateBasisCostDaysPDExtensions] (
    [InjuryEstimateBasisCostDaysPDExtensionsId] INT             NOT NULL,
    [PersonEventId]                             INT             NOT NULL,
    [InjuryID]                                  INT             NOT NULL,
    [LookupType]                                INT             NOT NULL,
    [Minimum]                                   DECIMAL (10, 2) NOT NULL,
    [Maximum]                                   DECIMAL (10, 2) NOT NULL,
    [StartDate]                                 DATETIME        NOT NULL,
    [EndDate]                                   DATETIME        NOT NULL,
    [Average]                                   DECIMAL (10, 2) NOT NULL,
    [IsDeleted]                                 BIT             NOT NULL,
    [CreatedBy]                                 VARCHAR (50)    NOT NULL,
    [CreatedDate]                               DATETIME        NOT NULL,
    [ModifiedBy]                                VARCHAR (50)    NOT NULL,
    [ModifiedDate]                              DATETIME        NOT NULL,
    CONSTRAINT [PK__InjuryEstimateBasisCostDaysPDExtensions] PRIMARY KEY CLUSTERED ([InjuryEstimateBasisCostDaysPDExtensionsId] ASC),
    CONSTRAINT [FK_InjuryEstimateBasisCostDaysPDExtensions_Injury] FOREIGN KEY ([InjuryID]) REFERENCES [claim].[Injury] ([InjuryId]),
    CONSTRAINT [FK_InjuryEstimateBasisCostDaysPDExtensions_PersonEvent] FOREIGN KEY ([PersonEventId]) REFERENCES [claim].[PersonEvent] ([PersonEventId])
);


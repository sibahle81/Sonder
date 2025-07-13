CREATE TABLE [medical].[ClinicVenue] (
    [ClinicVenueID]             INT             IDENTITY (1, 1) NOT NULL,
    [Name]                      NVARCHAR (50)   NOT NULL,
    [Description]               NVARCHAR (2048) NULL,
    [LastChangedBy]             VARCHAR (30)    NULL,
    [LastChangedDate]           DATETIME        NULL,
    [PMPRegionID]               INT             NULL,
    [ClinicBookingTypeID]       INT             CONSTRAINT [DF__ClinicVenue_ClinicBookingTypeID] DEFAULT ((0)) NOT NULL,
    [TebaLocationID]            INT             NULL,
    [MobileClinicBookingTypeID] INT             NULL,
    [IsActive]                  BIT             NOT NULL,
    [IsDeleted]                 BIT             NOT NULL,
    [CreatedBy]                 VARCHAR (50)    NOT NULL,
    [CreatedDate]               DATETIME        NOT NULL,
    [ModifiedBy]                VARCHAR (50)    NOT NULL,
    [ModifiedDate]              DATETIME        NOT NULL,
    CONSTRAINT [PK_Compensation_ClinicVenue_ClinicVenueID] PRIMARY KEY CLUSTERED ([ClinicVenueID] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);


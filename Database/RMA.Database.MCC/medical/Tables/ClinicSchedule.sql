CREATE TABLE [medical].[ClinicSchedule] (
    [ClinicScheduleId]    INT            IDENTITY (1, 1) NOT NULL,
    [ClinicVenueId]       INT            NOT NULL,
    [ScheduledDate]       DATETIME       NOT NULL,
    [PersonCapacity]      DECIMAL (7, 2) NOT NULL,
    [BookingStatus]       TINYINT        NULL,
    [ClinicBookingTypeId] INT            NULL,
    [IsMobileClinic]      BIT            CONSTRAINT [DF__ClinicSchedule_Temp_IsMobileClinic] DEFAULT ((0)) NOT NULL,
    [IsAssessmentClinic]  BIT            CONSTRAINT [DF__ClinicSchedule_Temp_IsAssessmentClinic] DEFAULT ((0)) NOT NULL,
    [IsActive]            BIT            NOT NULL,
    [IsDeleted]           BIT            NOT NULL,
    [CreatedBy]           VARCHAR (50)   NOT NULL,
    [CreatedDate]         DATETIME       NOT NULL,
    [ModifiedBy]          VARCHAR (50)   NOT NULL,
    [ModifiedDate]        DATETIME       NOT NULL,
    CONSTRAINT [PK_Medical_ClinicSchedule_Temp_ClinicScheduleId] PRIMARY KEY CLUSTERED ([ClinicScheduleId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Medical_ClinicSchedule_Temp_ClinicVenueId] FOREIGN KEY ([ClinicVenueId]) REFERENCES [medical].[ClinicVenue] ([ClinicVenueID])
);


CREATE TABLE [medical].[ClinicBookingType] (
    [ClinicBookingTypeId] INT          IDENTITY (1, 1) NOT NULL,
    [Name]                VARCHAR (50) NOT NULL,
    [IsActive]            BIT          NOT NULL,
    [IsDeleted]           BIT          NOT NULL,
    [CreatedBy]           VARCHAR (50) NOT NULL,
    [CreatedDate]         DATETIME     NOT NULL,
    [ModifiedBy]          VARCHAR (50) NOT NULL,
    [ModifiedDate]        DATETIME     NOT NULL,
    CONSTRAINT [PK_Medical_ClinicBookingType_Temp_ClinicBookingTypeId] PRIMARY KEY CLUSTERED ([ClinicBookingTypeId] ASC) WITH (FILLFACTOR = 95)
);


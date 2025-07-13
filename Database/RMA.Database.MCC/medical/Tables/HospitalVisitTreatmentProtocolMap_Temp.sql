CREATE TABLE [medical].[HospitalVisitTreatmentProtocolMap_Temp] (
    [HospitalVisitTreatmentProtocolMapID] INT          IDENTITY (1, 1) NOT NULL,
    [HospitalVisitId]                     INT          NOT NULL,
    [TreatmentProtocolID]                 INT          NOT NULL,
    [LastChangedBy]                       VARCHAR (50) NULL,
    [LastChangedDate]                     DATETIME     NULL,
    [IsActive]                            BIT          NOT NULL,
    [IsDeleted]                           BIT          NOT NULL,
    [CreatedBy]                           VARCHAR (50) NOT NULL,
    [CreatedDate]                         DATETIME     NOT NULL,
    [ModifiedBy]                          VARCHAR (50) NOT NULL,
    [ModifiedDate]                        DATETIME     NOT NULL,
    CONSTRAINT [PK_HospitalVisitTreatmentProtocolMap] PRIMARY KEY CLUSTERED ([HospitalVisitTreatmentProtocolMapID] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_HospitalVisitTreatmentProtocolMap_TreatmentProtocol] FOREIGN KEY ([TreatmentProtocolID]) REFERENCES [medical].[TreatmentProtocol] ([Id])
);


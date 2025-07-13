CREATE TABLE [medical].[PreAuthMotivationForClaimReopening] (
    [PreAuthMotivationForClaimReopeningId] INT                                                 IDENTITY (1, 1) NOT NULL,
    [PreAuthId]                            INT                                                 NOT NULL,
    [ReferringDoctorId]                    INT                                                 NULL,
    [RequestStatusId]                      INT                                                 NULL,
    [InjuryDetails]                        VARCHAR (2048) MASKED WITH (FUNCTION = 'default()') NULL,
    [RelationWithOldInjury]                VARCHAR (2048) MASKED WITH (FUNCTION = 'default()') NULL,
    [AdmissionDate]                        DATETIME                                            NULL,
    [ProcedureDate]                        DATETIME                                            NOT NULL,
    [Motivation]                           VARCHAR (2048) MASKED WITH (FUNCTION = 'default()') NULL,
    [Comment]                              VARCHAR (2048) MASKED WITH (FUNCTION = 'default()') NULL,
    [SubmittedByUser]                      VARCHAR (50)                                        NOT NULL,
    [SubmittedDate]                        DATETIME                                            NOT NULL,
    [IsActive]                             BIT                                                 NOT NULL,
    [IsDeleted]                            BIT                                                 NOT NULL,
    [CreatedBy]                            VARCHAR (50)                                        NOT NULL,
    [CreatedDate]                          DATETIME                                            NOT NULL,
    [ModifiedBy]                           VARCHAR (50)                                        NOT NULL,
    [ModifiedDate]                         DATETIME                                            NOT NULL,
    CONSTRAINT [PK_medical_PreAuthMotivationForClaimReopening_PreAuthMotivationForClaimReopeningId] PRIMARY KEY CLUSTERED ([PreAuthMotivationForClaimReopeningId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Medical_PreAuthMotivationForClaimReopening_PreAuthorisation] FOREIGN KEY ([PreAuthId]) REFERENCES [medical].[PreAuthorisation] ([PreAuthId])
);


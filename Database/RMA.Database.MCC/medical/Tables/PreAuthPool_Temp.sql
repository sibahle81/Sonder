CREATE TABLE [medical].[PreAuthPool_Temp] (
    [PreAuthPoolId]   INT                                                IDENTITY (1, 1) NOT NULL,
    [PreAuthId]       INT                                                NOT NULL,
    [IDType]          VARCHAR (10)                                       NULL,
    [IDNumber]        VARCHAR (15) MASKED WITH (FUNCTION = 'default()')  NULL,
    [PersonId]        INT                                                DEFAULT (NULL) NULL,
    [PersonName]      VARCHAR (100) MASKED WITH (FUNCTION = 'default()') NULL,
    [IsLinkedToClaim] BIT                                                DEFAULT ((0)) NULL,
    [IsActive]        BIT                                                NOT NULL,
    [IsDeleted]       BIT                                                NOT NULL,
    [CreatedBy]       VARCHAR (50)                                       NOT NULL,
    [CreatedDate]     DATETIME                                           NOT NULL,
    [ModifiedBy]      VARCHAR (50)                                       NOT NULL,
    [ModifiedDate]    DATETIME                                           NOT NULL,
    PRIMARY KEY CLUSTERED ([PreAuthPoolId] ASC),
    CONSTRAINT [FK_Medical_PreAuthPool_Temp_PreAuthorisation] FOREIGN KEY ([PreAuthId]) REFERENCES [medical].[PreAuthorisation] ([PreAuthId])
);


CREATE TABLE [medical].[ProsthetistType_Temp] (
    [ProsthetistTypeId]    INT            IDENTITY (1, 1) NOT NULL,
    [ProsthetistTypeName]  VARCHAR (50)   NULL,
    [Description]          VARCHAR (2048) NOT NULL,
    [RequireSpecification] BIT            NOT NULL,
    [IsActive]             BIT            NOT NULL,
    [IsDeleted]            BIT            NOT NULL,
    [CreatedBy]            VARCHAR (50)   NOT NULL,
    [CreatedDate]          DATETIME       NOT NULL,
    [ModifiedBy]           VARCHAR (50)   NOT NULL,
    [ModifiedDate]         DATETIME       NOT NULL
);


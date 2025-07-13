CREATE TABLE [medical].[PreAuthStatus_Temp] (
    [PreAuthStatusId] INT          NOT NULL,
    [Name]            VARCHAR (20) NOT NULL,
    [Description]     VARCHAR (20) NOT NULL,
    [IsActive]        BIT          NOT NULL,
    [IsDeleted]       BIT          NOT NULL,
    [CreatedBy]       VARCHAR (50) NOT NULL,
    [CreatedDate]     DATETIME     NOT NULL,
    [ModifiedBy]      VARCHAR (50) NOT NULL,
    [ModifiedDate]    DATETIME     NOT NULL,
    PRIMARY KEY CLUSTERED ([PreAuthStatusId] ASC)
);


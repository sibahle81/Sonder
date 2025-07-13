CREATE TABLE [medical].[ReportStatus_Temp] (
    [ReportStatusId] INT          IDENTITY (1, 1) NOT NULL,
    [Status]         VARCHAR (20) NOT NULL,
    [CanCloseClaim]  BIT          DEFAULT ((0)) NOT NULL,
    [IsActive]       BIT          DEFAULT ((0)) NOT NULL,
    [IsDeleted]      BIT          NOT NULL,
    [CreatedBy]      VARCHAR (50) NOT NULL,
    [CreatedDate]    DATETIME     NOT NULL,
    [ModifiedBy]     VARCHAR (50) NOT NULL,
    [ModifiedDate]   DATETIME     NOT NULL,
    PRIMARY KEY CLUSTERED ([ReportStatusId] ASC) WITH (FILLFACTOR = 95)
);


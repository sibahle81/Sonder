CREATE TABLE [common].[SLAItemTypeConfiguration] (
    [SLAItemTypeConfigurationId]       INT          IDENTITY (1, 1) NOT NULL,
    [SLAItemTypeId]                    INT          NOT NULL,
    [NumberOfDaysAmberSLA]             INT          NULL,
    [NumberOfDaysRedSLA]               INT          NULL,
    [RedSLANotificationPermission]     VARCHAR (50) NULL,
    [IsDeleted]                        BIT          NOT NULL,
    [CreatedBy]                        VARCHAR (50) NOT NULL,
    [CreatedDate]                      DATETIME     NOT NULL,
    [ModifiedBy]                       VARCHAR (50) NOT NULL,
    [ModifiedDate]                     DATETIME     NOT NULL,
    [AmberSLANotificationPermission]   VARCHAR (50) NULL,
    [IncludeEmailNotificationAmberSLA] BIT          CONSTRAINT [DF_SLAItemTypeConfiguration_IncludeEmailNotificationAmberSLA] DEFAULT ((0)) NULL,
    [IncludeEmailNotificationRedSLA]   BIT          CONSTRAINT [DF_SLAItemTypeConfiguration_IncludeEmailNotificationRedSLA] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_SLAItemTypeConfiguration] PRIMARY KEY CLUSTERED ([SLAItemTypeConfigurationId] ASC)
);


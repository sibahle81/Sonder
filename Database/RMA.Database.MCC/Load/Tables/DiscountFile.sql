CREATE TABLE [Load].[DiscountFile] (
    [Id]             INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier] UNIQUEIDENTIFIER NOT NULL,
    [FileName]       VARCHAR (100)    NOT NULL,
    [IsDeleted]      BIT              CONSTRAINT [DF_DiscountFile_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]      VARCHAR (50)     CONSTRAINT [DF_DiscountFile_CreatedBy] DEFAULT ('system@randmutual.co.za') NOT NULL,
    [CreatedDate]    DATETIME         CONSTRAINT [DF_DiscountFile_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]     VARCHAR (50)     CONSTRAINT [DF_DiscountFile_ModifiedBy] DEFAULT ('system@randmutual.co.za') NOT NULL,
    [ModifiedDate]   DATETIME         CONSTRAINT [DF_DiscountFile_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK__DiscountF__3214EC0708ECB16D] PRIMARY KEY CLUSTERED ([Id] ASC)
);


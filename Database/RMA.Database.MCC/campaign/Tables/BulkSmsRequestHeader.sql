CREATE TABLE [campaign].[BulkSmsRequestHeader] (
    [BulkSmsRequestHeaderId] INT           IDENTITY (1, 1) NOT NULL,
    [Department]             INT           NOT NULL,
    [Campaign]               VARCHAR (100) NOT NULL,
    [IsDeleted]              BIT           CONSTRAINT [DF_BulkSmsRequestHeader_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]              VARCHAR (50)  NOT NULL,
    [CreatedDate]            DATETIME      CONSTRAINT [DF_BulkSmsRequestHeader_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]             VARCHAR (50)  NOT NULL,
    [ModifiedDate]           DATETIME      CONSTRAINT [DF_BulkSmsRequestHeader_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_BulkSmsRequestHeader] PRIMARY KEY CLUSTERED ([BulkSmsRequestHeaderId] ASC)
);


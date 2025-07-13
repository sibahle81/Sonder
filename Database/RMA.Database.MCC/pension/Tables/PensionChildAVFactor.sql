CREATE TABLE [pension].[PensionChildAVFactor] (
    [PensionChildAVFactorId] INT             IDENTITY (1, 1) NOT NULL,
    [Age]                    INT             NOT NULL,
    [Value]                  NUMERIC (18, 6) NOT NULL,
    [IsActive]               BIT             CONSTRAINT [DF_PensionChildAVFactor_IsActive] DEFAULT ((1)) NOT NULL,
    [IsDeleted]              BIT             CONSTRAINT [DF_PensionChildAVFactor_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]              VARCHAR (50)    NOT NULL,
    [CreatedDate]            DATETIME        CONSTRAINT [DF_PensionChildAVFactor_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]             VARCHAR (50)    NOT NULL,
    [ModifiedDate]           DATETIME        CONSTRAINT [DF_PensionChildAVFactor_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK__pension_PensionChildAVFactor] PRIMARY KEY CLUSTERED ([PensionChildAVFactorId] ASC)
);


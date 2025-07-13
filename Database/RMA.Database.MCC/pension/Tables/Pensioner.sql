CREATE TABLE [pension].[Pensioner] (
    [PensionerId]       INT          IDENTITY (1, 1) NOT NULL,
    [PensionClaimMapId] INT          NULL,
    [FamilyUnit]        INT          NULL,
    [BeneficiaryTypeId] INT          NOT NULL,
    [ScheduleDate]      DATETIME     NULL,
    [IsScheduleON]      BIT          NULL,
    [AttendedClinic]    BIT          NULL, 
    [ExcludePMPSchedule] BIT         NULL,
    [IsActive]          BIT          CONSTRAINT [DF_Pensioner_IsActive] DEFAULT ((1)) NOT NULL,
    [IsDeleted]         BIT          CONSTRAINT [DF_Pensioner_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]         VARCHAR (50) NOT NULL,
    [CreatedDate]       DATETIME     CONSTRAINT [DF_Pensioner_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]        VARCHAR (50) NOT NULL,
    [PersonId]          INT          NULL,
    [ModifiedDate]      DATETIME     CONSTRAINT [DF_Pensioner_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK__pension_Pensioner] PRIMARY KEY CLUSTERED ([PensionerId] ASC),
    CONSTRAINT [FK_Pensioner_BeneficiaryType] FOREIGN KEY ([BeneficiaryTypeId]) REFERENCES [common].[BeneficiaryType] ([Id]),
    CONSTRAINT [FK_Pensioner_PensionClaimMap] FOREIGN KEY ([PensionClaimMapId]) REFERENCES [pension].[PensionClaimMap] ([PensionClaimMapId])
);






GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



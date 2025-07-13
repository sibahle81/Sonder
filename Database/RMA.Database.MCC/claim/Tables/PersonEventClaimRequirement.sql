CREATE TABLE [claim].[PersonEventClaimRequirement](
	[PersonEventClaimRequirementId] [int] IDENTITY(1,1) NOT NULL,
	[PersonEventId] [int] NOT NULL,
	[ClaimRequirementCategoryId] [int] NOT NULL,
	[Instruction] [varchar](500) NULL,
	[DateOpened] [datetime] NOT NULL,
	[DateClosed] [datetime] NULL,
	[isDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](100) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](100) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[PersonEventClaimRequirementId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [claim].[PersonEventClaimRequirement] ADD  DEFAULT ((0)) FOR [isDeleted]
GO

ALTER TABLE [claim].[PersonEventClaimRequirement] ADD  DEFAULT (getdate()) FOR [CreatedDate]
GO

ALTER TABLE [claim].[PersonEventClaimRequirement] ADD  DEFAULT (getdate()) FOR [ModifiedDate]
GO

ALTER TABLE [claim].[PersonEventClaimRequirement]  WITH CHECK ADD  CONSTRAINT [FK_PersonEventClaimRequirement_ClaimRequirementCategory] FOREIGN KEY([ClaimRequirementCategoryId])
REFERENCES [claim].[ClaimRequirementCategory] ([ClaimRequirementCategoryId])
GO

ALTER TABLE [claim].[PersonEventClaimRequirement] CHECK CONSTRAINT [FK_PersonEventClaimRequirement_ClaimRequirementCategory]
GO

ALTER TABLE [claim].[PersonEventClaimRequirement]  WITH CHECK ADD  CONSTRAINT [FK_PersonEventClaimRequirement_PersonEvent] FOREIGN KEY([PersonEventId])
REFERENCES [claim].[PersonEvent] ([PersonEventId])
GO

ALTER TABLE [claim].[PersonEventClaimRequirement] CHECK CONSTRAINT [FK_PersonEventClaimRequirement_PersonEvent]
GO


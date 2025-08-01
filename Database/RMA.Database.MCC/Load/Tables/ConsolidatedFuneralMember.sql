CREATE TABLE [Load].[ConsolidatedFuneralMember](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[FileIdentifier] [uniqueidentifier] NOT NULL,
	[ClientReference] [varchar](64) NOT NULL,
	[JoinDate] [date] NULL,
	[CoverMemberTypeId] [int] NOT NULL,
	[RolePlayerTypeId] [int] NOT NULL,
	[IdTypeId] [int] NOT NULL,
	[IdNumber] [varchar](64) NOT NULL,
	[MainMemberIdNumber] [varchar](32) NOT NULL,
	[FirstName] [varchar](64) NOT NULL,
	[Surname] [varchar](64) NOT NULL,
	[MemberName] [varchar](128) NOT NULL,
	[DateOfBirth] [date] NULL,
	[Age] [int] NOT NULL,
	[JoinAge] [int] NOT NULL,
	[BenefitName] [varchar](128) NULL,
	[PolicyId] [int] NOT NULL,
	[PolicyPremium] [decimal](18, 2) NOT NULL,
	[PolicyCover] [decimal](18, 2) NOT NULL,
	[ExistingCover] [decimal](18, 2) NULL,
	[Multiplier] [int] NOT NULL,
	[RolePlayerId] [int] NOT NULL,
	[MainMemberRolePlayerId] [int] NOT NULL,
	[BenefitId] [int] NOT NULL,
	[PolicyExists] [bit] NOT NULL,
	[RolePlayerExists] [bit] NOT NULL,
	[Address1] [varchar](256) NULL,
	[Address2] [varchar](256) NULL,
	[City] [varchar](256) NULL,
	[Province] [varchar](256) NULL,
	[Country] [varchar](256) NULL,
	[PostalCode] [varchar](8) NULL,
	[PostalAddress1] [varchar](256) NULL,
	[PostalAddress2] [varchar](256) NULL,
	[PostalCity] [varchar](256) NULL,
	[PostalProvince] [varchar](256) NULL,
	[PostalCountry] [varchar](256) NULL,
	[PostalPostCode] [varchar](8) NULL,
	[TelNo] [varchar](32) NULL,
	[CelNo] [varchar](32) NULL,
	[Email] [varchar](128) NULL,
	[PreferredCommunication] [int] NULL,
	[AnnualIncreaseType] [int] NULL,
	[AnnualIncreaseMonth] [int] NULL,
	[DebitOrderDay] [int] NULL,
	[EuropAssist] [bit] NOT NULL,
	[TestDateOfBirth] [varchar](24) NULL,
	[TestJoinDate] [varchar](24) NULL,
 CONSTRAINT [PK_ConsolidatedFuneralMember] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



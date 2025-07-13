CREATE PROCEDURE [Load].[ValidatePremiumListingMemberIdNumber] (@fileIdentifier uniqueidentifier)
AS BEGIN

DECLARE @records INT = 0;
DECLARE @start INT = 1;
DECLARE @PremiumListing TABLE(
    [Id_Gen] [int] NOT NULL,
	[Id] [int] NOT NULL,
	[FileIdentifier] [uniqueidentifier] NOT NULL,
	[Company] [varchar](256) NULL,
	[PolicyNumber] [varchar](64) NULL,
	[ClientReference] [varchar](64) NULL,
	[JoinDate] [varchar](32) NULL,
	[ClientType] [varchar](32) NULL,
	[FirstName] [varchar](256) NULL,
	[Surname] [varchar](256) NULL,
	[MainMemberID] [varchar](32) NULL,
	[IdNumber] [varchar](32) NULL,
	[PassportNumber] [varchar](32) NULL,
	[DateOfBirth] [varchar](32) NULL,
	[BenefitName] [varchar](64) NULL,
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
	[Telephone] [varchar](24) NULL,
	[Mobile] [varchar](24) NULL,
	[Email] [varchar](128) NULL,
	[PreferredCommunication] [varchar](24) NULL,
	[PreviousInsurer] [varchar](256) NULL,
	[PreviousInsurerStartDate] [varchar](32) NULL,
	[PreviousInsurerEndDate] [varchar](32) NULL,
	[PreviousInsurerPolicyNumber] [varchar](50) NULL,
	[ExcelRowNumber] [varchar](50) NULL)

INSERT INTO @PremiumListing ([Id_Gen],[Id],[FileIdentifier],[Company],[PolicyNumber],[ClientReference],[JoinDate],
	[ClientType],[FirstName],[Surname],[MainMemberID],[IdNumber],[PassportNumber],[DateOfBirth],[BenefitName],
	[Address1],[Address2],[City],[Province],[Country],[PostalCode],[PostalAddress1],[PostalAddress2],[PostalCity],
	[PostalProvince],[PostalCountry],[PostalPostCode],[Telephone],[Mobile],[Email],[PreferredCommunication],
	[PreviousInsurer],[PreviousInsurerStartDate],[PreviousInsurerEndDate],[PreviousInsurerPolicyNumber],[ExcelRowNumber])

(SELECT ROW_NUMBER() OVER(ORDER BY Id),* FROM [Load].[PremiumListing] WHERE [FileIdentifier] = @fileIdentifier AND 
(len(IdNumber) = 13)
AND (isnumeric(IdNumber) = 1) 
AND ([PassportNumber] = ''))

SET @records = (SELECT COUNT(*) FROM @PremiumListing)

WHILE @start < @records + 1
BEGIN
 


DECLARE @errorTable TABLE (
		[FileIdentifier] varchar(512),
		[ErrorCategory] varchar(64),
		[ErrorMessage] varchar(1024),
		[PolicyNumber] varchar(100),
		[IdNumber] varchar(100),
		[Name] varchar(100),
		[Surname] varchar(100),
		[ExcelRowNumber] varchar(100)
	)

DECLARE @idNumber Varchar(20);
DECLARE @tempTotal int = 0;
DECLARE @checkSum int = 0;
DECLARE @multiplier int = 1;

SET @idNumber = (SELECT IdNumber FROM @PremiumListing WHERE [Id_Gen] = @start)

DECLARE @cnt INT = 1;

WHILE @cnt < 14
BEGIN
   SET @tempTotal = (CONVERT(INT,SUBSTRING(@idNumber,@cnt,1)) * @multiplier)
   IF(@tempTotal > 9)
   BEGIN
      SET @tempTotal = CONVERT(INT,LEFT(@tempTotal,1)) + CONVERT(INT,RIGHT(@tempTotal,1))
   END

   SET @checkSum = @checkSum + @tempTotal
   IF((@multiplier % 2) = 0)
   BEGIN
      SET @multiplier = 1
   END
   ELSE
   BEGIN
      SET @multiplier = 2
   END
   SET @cnt = @cnt + 1;
END;
--PRINT @checkSum % 10
IF((@checkSum % 10) != 0)
   BEGIN
      insert into @errorTable
		select [FileIdentifier], 'Invalid ID Numbers - Authentication',
			concat('Member ',[FirstName],' born on ',[DateOfBirth],' does not have a valid ID number (',[IdNumber],').'),
                ISNULL([PolicyNumber],''),
				ISNULL([IdNumber],''),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		FROM @PremiumListing WHERE [Id_Gen] = @start
   END
  SET @start = @start + 1;
END;

   IF EXISTS (SELECT TOP 1 * FROM @errorTable) BEGIN
	   INSERT INTO [policy].[PremiumListingErrorAudit] ([PolicyNumber],[IdNumber],[Name],[Surname],[FileIdentifier], [ErrorCategory], [ErrorMessage],[ExcelRowNumber])
		SELECT DISTINCT [PolicyNumber],[IdNumber],[Name],[Surname],[FileIdentifier], [ErrorCategory], [ErrorMessage],[ExcelRowNumber] FROM @errorTable
		ORDER BY [ErrorCategory], [ErrorMessage]
	END
END
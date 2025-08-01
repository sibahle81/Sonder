
CREATE PROCEDURE [billing].[MainMemberList] @clientTypeId INT
AS
BEGIN

DECLARE @currentYear INT = DATEPART(YEAR, GETDATE());
DECLARE @currentMonth INT = DATEPART(MONTH, GETDATE());

	SET NOCOUNT ON;

	DECLARE @temp TABLE (
		PolicyId INT
	   ,PolicyNumber VARCHAR(50)
	   ,PolicyStatus VARCHAR(50)
	   ,BrokerId INT
	   ,Broker VARCHAR(51)
	   ,BankAccountId INT
	   ,AccountHolder VARCHAR(255)
	   ,BankId INT
	   ,BankName VARCHAR(50)
	   ,BankBranchCode VARCHAR(50)
	   ,BankAccountTypeId INT
	   ,BankAccountType VARCHAR(50)
	   ,BankAccountNumber VARCHAR(50)
	   ,PaymentMethodId INT
	   ,PaymentMethod VARCHAR(50)
	   ,PaymentFrequencyId INT
	   ,PremiumFrequency VARCHAR(50)
	   ,OriginalDebitOrderDate DATETIME
	   ,PreviousDebitOrderDate DATETIME
	   ,NextDebitOrderDate DATETIME
	   ,CommenceDate DATETIME
	   ,CurrentPremium DECIMAL(18, 2)
	)

	INSERT @temp
		SELECT
			p.Id AS PolicyId
		   ,PolicyNumber AS PolicyNumber
		   ,p.[Status] AS PolicyStatus
		   ,b.Id AS BrokerId
		   ,RTRIM(LTRIM(b.Name)) + ' ' + RTRIM(LTRIM(b.Surname)) AS Broker
		   ,ba.Id AS BankAccountId
		   ,ba.AccountHolderName AS AccountHolder
		   ,b1.Id AS BankId
		   ,b1.Name AS BankName
		   ,b1.UniversalBranchCode AS BankBranchCode
		   ,bat.Id AS BankAccountTypeId
		   ,bat.Name AS BankAccountType
		   ,ba.AccountNumber AS BankAccountNumber
		   ,pm.Id AS PaymentMethodId
		   ,pm.Name AS PaymentMethod
		   ,ft.Id AS PaymentFrequencyId
		   ,ft.Name AS PremiumFrequency
		    ,p.InstallmentDate AS OriginalDebitOrderDate,
       CASE
           WHEN EOMONTH(p.InstallmentDate) = p.InstallmentDate THEN
               DATEADD(MONTH, -1, EOMONTH(GETDATE()))
           ELSE
               CASE
                   WHEN DATEFROMPARTS(@currentYear, @currentMonth, DATEPART(DAY, p.InstallmentDate)) < GETDATE() THEN
                       DATEFROMPARTS(@currentYear, @currentMonth, DATEPART(DAY, p.InstallmentDate))
                   ELSE
                       DATEADD(MONTH, -1, DATEFROMPARTS(@currentYear, @currentMonth, DATEPART(DAY, p.InstallmentDate)))
               END
       END AS PreviousInstallmentDate,
       CASE
           WHEN EOMONTH(p.InstallmentDate) = p.InstallmentDate THEN
               EOMONTH(GETDATE())
           ELSE
               CASE
                   WHEN DATEFROMPARTS(@currentYear, @currentMonth, DATEPART(DAY, p.InstallmentDate)) < GETDATE() THEN
                       DATEADD(MONTH, 1, DATEFROMPARTS(@currentYear, @currentMonth, DATEPART(DAY, p.InstallmentDate)))
                   ELSE
                       DATEFROMPARTS(@currentYear, @currentMonth, DATEPART(DAY, p.InstallmentDate))
               END
       END AS NextInstallmentDate,

		   p.InceptionDate AS CommenceDate
		   ,p.PayablePremium AS CurrentPremium
		FROM policy.policy p 
		INNER JOIN Client.Broker b 
			ON p.BrokerId = b.Id
				AND p.IsActive = 1
				AND p.IsDeleted = 0
				AND b.IsActive = 1
				AND b.IsDeleted = 0
		INNER JOIN Client.Client c 
			ON p.ClientId = c.Id
				AND p.IsActive = 1
				AND p.IsDeleted = 0
				AND c.IsActive = 1
				AND c.IsDeleted = 0
		INNER JOIN Client.BankAccount ba 
			ON p.BankAccountId = ba.Id
				AND p.IsActive = 1
				AND p.IsDeleted = 0
				AND ba.IsActive = 1
				AND ba.IsDeleted = 0
		INNER JOIN [AZU-MOD-CFG].[common].[Bank] b1 
			ON ba.BankId = b1.Id
				AND ba.IsActive = 1
				AND ba.IsDeleted = 0
				AND b1.IsActive = 1
				AND b1.IsDeleted = 0
		LEFT OUTER JOIN [AZU-MOD-CFG].[common].[BankAccountType] bat 
			ON ba.AccountTypeId = bat.Id
				AND ba.IsActive = 1
				AND ba.IsDeleted = 0
				AND bat.IsActive = 1
				AND bat.IsDeleted = 0
		INNER JOIN [AZU-MOD-CFG].[common].[PaymentMethod] pm 
			ON ba.PaymentMethodId = pm.Id
				AND ba.IsActive = 1
				AND ba.IsDeleted = 0
				AND pm.IsActive = 1
				AND pm.IsDeleted = 0
		INNER JOIN [AZU-MOD-CFG].[common].[FrequencyType] ft 
			ON p.BillingFrequencyId = ft.Id
				AND p.IsActive = 1
				AND p.IsDeleted = 0
				AND ft.IsActive = 1
				AND ft.IsDeleted = 0
		WHERE c.ClientTypeId = @clientTypeId

	SELECT
		*
	FROM @temp
END




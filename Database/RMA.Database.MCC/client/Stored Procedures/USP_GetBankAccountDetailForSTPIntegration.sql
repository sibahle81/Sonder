
CREATE PROCEDURE [client].[USP_GetBankAccountDetailForSTPIntegration] 
(
	@OwnerID INT,
	@OwnerType INT
)
AS 
BEGIN 

DECLARE @ServerName nvarchar(50) = (SELECT base_object_name FROM sys.synonyms WHERE name in ('CompCareServerName'));
DECLARE @DatabaseName nvarchar(50) =  (SELECT base_object_name FROM sys.synonyms WHERE name in ('RMADatabaseName'));
DECLARE @TSQL nvarchar(250)
SET @TSQL = N'EXEC '+@ServerName+'.'+@DatabaseName+'.[Compensation].[USP_GetBankAccountDetail] @OwnerID = '+CAST(@OwnerID as nvarchar(50))+', @OwnerType = '+CAST(@OwnerType as nvarchar(50))
EXEC (@TSQL)
WITH RESULT SETS
(
	(

	  BankName VARCHAR(150),
	  BankBranchName VARCHAR(150),
	  AccountType VARCHAR(150),
	  AccountNumber VARCHAR(150),
	  FinancialSystemCode VARCHAR(150),
	  PaymentMethodName VARCHAR(150),
	  CurrencyTypeName VARCHAR(150),
	  AccountHolderName VARCHAR(150),
	  IsApproved BIT,
	  BranchCode VARCHAR(150),
	  BankAccountType INT,
	  PaymentMethodID INT,
	  CurrencyTypeID INT,
	  BankingDetailID INT,
	  BankID INT,
	  BankBranchID INT,
	  AccountHolderName VARCHAR(150),
	  BankLastChangedBy VARCHAR(150)
 
	)
);


END
GO

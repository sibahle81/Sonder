CREATE PROCEDURE [payment].[GetPaymentsReport]
	@DateFrom DATE,
	@DateTo DATE,
	@PaymentTypeId INT=0,
	@ClaimTypeId INT = 0,
	@PaymentStatusId INT=0,
	@Query NVARCHAR(50)= NULL

	WITH RECOMPILE
AS

 BEGIN 

 	CREATE TABLE #Payments  (
		    [ID] [int]  NOT NULL,
			[ClaimId] [int] NULL,
			[PolicyId] [int] NULL,
			[RefundHeaderId] [int] NULL,
			[Bank] [varchar](50) NULL,
			[BankBranch] [varchar](50) NULL,
			[BankAccountTypeId] [int] NULL,
			[Payment Reference] [varchar](250) NULL,
			[Batch No] [varchar](250) NULL,
			[Authorised DATE] [datetime] NULL,
			[Submission DATE] [datetime] NULL,
			[Rejection DATE] [datetime] NULL,
			[Payment DATE] [datetime] NULL,
			[Reconciliation DATE] [datetime] NULL,
			[Client Notification DATE] [datetime] NULL,
			[Company] [varchar](100) NULL,
			[Branch] [varchar](100) NULL,
			[Product] [varchar](100) NULL,
			[Payment Type] INT,
			[Payment Status] INT,
			[Claim Type] INT,
			[Client Type] INT,
			[Payee Details] [varchar](80) NOT NULL,
			[Claim No] [varchar](250) NULL,
			[Policy No] [varchar](250) NULL,
			[Amount] [money] NOT NULL,
			[Account Details] [varchar](17) NOT NULL,
			[Error Description] [varchar](MAX) NULL,
			[SENDerAccountNo] [varchar](17) NULL,
			[BankStatementReference] [varchar](100) NULL,			
			[Scheme] [varchar](250) NULL,
			[BrokerName] [varchar](250) NULL,
			[EmailAddress]  [varchar](250) NULL,
			[IsReversed] BIT,
			[CreatedBy] [varchar](250) NULL,
			[MaxSubmissionCount] [int] NULL,
			[SubmissionCount] [int] NULL
	);
	  INSERT INTO #Payments EXEC  [payment].[GetPayments] @DateFrom,@DateTo ,	@PaymentTypeId ,@ClaimTypeId ,@PaymentStatusId, @Query 

	  SELECT [P].[ID],
			[P].[Payment Reference],
			[P].[Batch No],
			[P].[Authorised DATE],
			[P].[Submission DATE],
			[P].[Rejection DATE], 
			[P].[Payment DATE],
			[P].[Reconciliation DATE],
			[P].[Client Notification DATE],
			[P].[Company],
			[P].[Branch],
			[P].[Product],
			[PT].[Name] [Payment Type],
			[PS].[Name] [Payment Status],
			[CLMT].[Name] [Claim Type],
			[P].[Payee Details],
			[P].[Claim No],
			[P].[Policy No],
			[P].[Amount],
			[P].[Account Details],
			[P].[Error Description],
			[P].[SENDerAccountNo],
			[P].[BankStatementReference],			
			[P].[Scheme],
			[P].[BrokerName],
			[P].[IsReversed]
			FROM #Payments [P]
	  			INNER JOIN [Common].[PaymentType] [PT](NOLOCK) ON [P].[Payment Type] = [PT].[Id]
				INNER JOIN [Common].[PaymentStatus] [PS](NOLOCK) ON [P].[Payment Status] = [PS].Id
				LEFT JOIN [common].[ClaimType] [CLMT](NOLOCK) ON [P].[Claim Type] =[CLMT].[Id]
	  	
		DROP TABLE #Payments
END

CREATE PROCEDURE [payment].[GetPaymentsProductOverview]
	@DateFrom DATE,
	@DateTo DATE,
	@PaymentStatusId INT,
	@Product NVARCHAR(50) = NULL,
	@Query NVARCHAR(50) = NULL
	
	WITH RECOMPILE
AS

 BEGIN 

 	 	CREATE TABLE #Payments  (
		    [PaymentId] [int]  NOT NULL,
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
			[PaymentTypeId] INT,
			[PaymentStatusId] INT,
			[ClaimTypeId] INT,
			[ClientTypeId] INT,
			[PayeeDetails] [varchar](80) NOT NULL,
			[ClaimNo] [varchar](250) NULL,
			[PolicyNo] [varchar](250) NULL,
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
	  
	  INSERT INTO #Payments EXEC [payment].[GetPayments] @DateFrom,@DateTo ,0 ,0 ,@PaymentStatusId, @Product

	  SELECT 
			[P].[Product],
			[PS].[Name] [PaymentStatus],
			 COUNT([P].[Product]) [Count],
			 SUM([P].[Amount]) [TotalAmount]
			 FROM #Payments [P]
				INNER JOIN [common].[PaymentStatus] [PS](NOLOCK) ON [P].[PaymentStatusId] = [PS].[Id]
			WHERE
		[P].[BrokerName] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [P].[BrokerName] END
		OR
		[P].[Scheme] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [P].[Scheme]  END

	  	GROUP BY [P].[Product], [PS].[Name]		

		DROP TABLE #Payments		
END

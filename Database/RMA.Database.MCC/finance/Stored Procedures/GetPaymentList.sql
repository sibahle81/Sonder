CREATE PROCEDURE [finance].[GetPaymentList]
	@DateFrom DATE,
	@DateTo DATE,
	@PaymentTypeId INT=0,
	@ClaimTypeId INT = 0,
	@PaymentStatusId INT=0,
	@Product VARCHAR(30)
   
	WITH RECOMPILE
AS

 BEGIN
	 SELECT [P].[PaymentId] [ID],
			[P].[Reference] [Payment Reference],
			[P].[BatchReference] [Batch No],
			[P].[CreatedDate] [Authorised DATE],
			[P].[SubmissionDate] [Submission DATE],
			[P].[RejectionDate] [Rejection DATE], 
			[P].[PaymentConfirmationDate] [Payment DATE],
			[P].[ReconciliationDate] [Reconciliation DATE],
			[P].[ClientNotificationDate] [Client Notification DATE],
			[P].[Company],
			[P].[Branch],
			[P].[Product],
			[P].[PaymentTypeId],
			[P].[PaymentStatusId],
			[P].[ClaimTypeId],
			[P].[Payee] [Payee Details],
			[P].[ClaimReference] [Claim No],
			[P].[PolicyReference] [Policy No],
			[P].[Amount],
			[P].[AccountNo] [Account Details],
			[PRC].[BriefDescription] [Error Description],
			[P].[SENDerAccountNo],
			[BSE].[UserReference] [BankStatementReference],			
			[PPRP].[DisplayName] [Scheme],
			[B].Name [BrokerName],
			[P].[EmailAddress] 
		FROM [payment].[payment] [P]
	
		INNER JOIN [policy].[policy] [POL] (NOLOCK) ON [P].[PolicyId] = [POL].[Policyid]
		INNER JOIN [product].[ProductOptionCoverType] [POCT] (NOLOCK) ON [POL].[ProductOptionId] = [POCT].[ProductOptionId]
		INNER JOIN [common].[CoverType] [CT] (NOLOCK) ON [POCT].[CoverTypeId] = [CT].[Id]
		LEFT JOIN [policy].[Policy] [PP] (NOLOCK) ON [POL].[ParentPolicyId] = [PP].[PolicyId]
		LEFT JOIN [client].[roleplayer] [PPRP](NOLOCK) ON [PPRP].RolePlayerId = [PP].[policyOwnerId]
		LEFT JOIN [broker].[Brokerage] [B](NOLOCK) ON [POL].[BrokerageId] = [B].[Id]
	
		LEFT JOIN [payment].[PaymentRejectionCode] [PRC] (NOLOCK) ON P.[ErrorCode] = [PRC].[Code] AND  [PRC].[IsDeleted] = 0 AND [PRC].[IsActive] = 1
		LEFT JOIN [payment].[FacsTransactionResults] [FACS] (NOLOCK) ON [FACS].[PaymentId] = [P].[PaymentId]
		LEFT JOIN [finance].[BankStatementEntry] [BSE] (NOLOCK) ON Convert(INT,[BSE].[RequisitionNumber ]) = Convert(INT,[FACS].[RequisitionNumber ]) AND [BSE].[UserReference2] = [FACS].[Reference2]
		WHERE  
			@DATEFROM <= CASE WHEN @PaymentStatusId = 2 THEN CAST([P].[SubmissionDate] AS DATE)
							  WHEN @PaymentStatusId = 3 THEN CAST([P].[PaymentConfirmationDate] AS DATE) 
							  WHEN @PaymentStatusId = 4 THEN CAST([P].[RejectionDate] AS DATE)
							  WHEN @PaymentStatusId = 5 THEN CAST([P].[ReconciliationDate] AS DATE)
			ELSE CAST([P].[CreatedDate] AS DATE) 
			END
			AND 
			@DATETO >= CASE WHEN @PaymentStatusId = 2 THEN CAST([P].[SubmissionDate] AS DATE)
							WHEN @PaymentStatusId = 3 THEN CAST([P].[PaymentConfirmationDate] AS DATE) 
							WHEN @PaymentStatusId = 4 THEN CAST([P].[RejectionDate] AS DATE)
							WHEN @PaymentStatusId = 5 THEN CAST([P].[ReconciliationDate] AS DATE)
			ELSE CAST([P].[CreatedDate] AS DATE)
			END
			AND
			[P].[PaymentTypeId] <> CASE WHEN @PaymentTypeId = 0 THEN 16 ELSE 0 END
			AND
			@PaymentTypeId = CASE WHEN @PaymentTypeId = 0 THEN 0				
					ELSE [P].[PaymentTypeId]
					END	
			AND
			@ClaimTypeId = CASE WHEN @ClaimTypeId = 0 THEN 0
							ELSE [P].[ClaimTypeId]
							END
			AND  
			@PaymentStatusId = CASE WHEN @PaymentStatusId = 0 THEN 0				
					ELSE [P].[PaymentStatusId]
					END
				
			AND 
			@Product = CASE WHEN @Product = 'All' THEN 'All'
					ELSE [P].[Product]
					END	
			Group By [P].[PaymentId],
					 [P].[Reference],
					 [P].[BatchReference],
					 [P].[CreatedDate],
					 [P].[SubmissionDate],
					 [P].[RejectionDate],
					 [P].[PaymentConfirmationDate],
					 [P].[ReconciliationDate],
					 [P].[ClientNotificationDate],
					 [P].[Company],
					 [P].[Branch],
					 [P].[Product],
					 [P].[PaymentTypeId],
					 [P].[PaymentStatusId],
					 [P].[ClaimTypeId],
					 [P].[Payee],
					 [P].[ClaimReference],
					 [P].[PolicyReference],
					 [P].[Amount],
					 [P].[AccountNo],
					 [PRC].[BriefDescription],
					 [P].[SENDerAccountNo],
					 [BSE].[UserReference],		
					 [PPRP].[DisplayName],
					 [B].[Name],
					 [P].[EmailAddress] 
		    ORDER BY [P].[PaymentId] ASC
END
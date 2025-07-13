CREATE PROCEDURE [finance].[PaymentListReport]
	@DATEFROM DATE,
	@DATETO DATE,
	@PaymentTypeId INT=0,
	@PaymentStatusId INT=0,
	@Product INT,
    @ClaimTypeId INT = NULL

AS

 BEGIN
 
 IF (@ClaimTypeId IS NULL)
 BEGIN
 SET @ClaimTypeId = 0
 END
 DECLARE @Products TABLE ([Id] INT,[Description]  VARCHAR(30));

 INSERT INTO @Products(Id,[Description])
  VALUES(0,'All'),
		(1,'Corporate'),
		(2,'Goldwage'),
		(3,'Group'),
		(4,'Individual')

DECLARE @SelectedProduct VARCHAR(30) 
SELECT TOP 1 @SelectedProduct = [Description] from @Products WHERE ID = @Product

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
			[CT].[Description] [Product],
			[PT].[Name] [Payment Type],
			[PS].[Name] [Payment Status],
			[CLMT].[Name] [Claim Type],
			[P].[Payee] [Payee Details],
			[P].[ClaimReference] [Claim No],
			[P].[PolicyReference] [Policy No],
			[P].[Amount],
			[P].[AccountNo] [Account Details],
			[PRC].[BriefDescription] [Error Description],
			[P].[SENDerAccountNo],
			[FACS].[UserReference] [BankStatementReference],			
			[PPRP].[DisplayName] [Scheme],
			[B].Name [BrokerName]
		FROM [payment].[payment] [P]
		INNER JOIN [Common].[PaymentType] [PT](NOLOCK) ON [P].[PaymentTypeId] = [PT].[Id]
		INNER JOIN [Common].[PaymentStatus] [PS](NOLOCK) ON [P].[PaymentStatusId] = [PS].Id
		INNER JOIN [policy].[policy] [POL] (NOLOCK) ON [P].[PolicyId] = [POL].[Policyid]
		INNER JOIN [product].[ProductOptionCoverType] [POCT] (NOLOCK) ON [POL].[ProductOptionId] = [POCT].[ProductOptionId]
		INNER JOIN [common].[CoverType] [CT] (NOLOCK) ON [POCT].[CoverTypeId] = [CT].[Id]
		LEFT JOIN [policy].[Policy] [PP] (NOLOCK) ON [POL].[ParentPolicyId] = [PP].[PolicyId]
		LEFT JOIN [client].[roleplayer] [PPRP](NOLOCK) ON [PPRP].RolePlayerId = [PP].[policyOwnerId]
		LEFT JOIN [broker].[Brokerage] [B](NOLOCK) ON [POL].[BrokerageId] = [B].[Id]
		LEFT JOIN [common].[ClaimType] [CLMT](NOLOCK) ON [CLMT].[Id] = [P].[ClaimTypeId]
		LEFT JOIN [payment].[PaymentRejectionCode] [PRC] (NOLOCK) ON P.[ErrorCode] = [PRC].[Code] AND  [PRC].[IsDeleted] = 0 AND [PRC].[IsActive] = 1
		OUTER APPLY	(SELECT TOP 1 [BSE].[UserReference] 
							FROM [payment].[FacsTransactionResults] [FACS] (NOLOCK)
								inner join [finance].[BankStatementEntry] [BSE] (NOLOCK)
								ON Convert(INT,[BSE].[RequisitionNumber ]) = Convert(INT,[FACS].[RequisitionNumber ])
								WHERE [FACS].[PaymentId] = [P].[PaymentId]
								and TRIM([FACS].[Reference2]) = TRIM([BSE].[UserReference2])
					) [FACS]
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
			@PaymentStatusId = CASE WHEN @PaymentStatusId = 0 THEN 0				
					ELSE [P].[PaymentStatusId]
					END
			AND
			[P].[PaymentTypeId] <> CASE WHEN @PaymentTypeId = 0 THEN 16 ELSE 0 END
			AND
			@PaymentTypeId = CASE WHEN @PaymentTypeId = 0 THEN 0				
					ELSE [P].[PaymentTypeId]
					END	
			AND 
			@SelectedProduct = CASE WHEN @Product = 0 THEN 'All'
					ELSE [CT].[Description]
					END
			AND
			@ClaimTypeId = CASE WHEN @ClaimTypeId = 0 THEN 0
							ELSE [CLMT].Id
							END
		    ORDER BY [P].[PaymentId] ASC
END

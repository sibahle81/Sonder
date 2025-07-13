




CREATE PROCEDURE [policy].[GetPolicyAuditTrail]
@ClientTypeId INT = NULL,
@StartDate DATE = NULL,
@EndDate DATE = NULL,
@PeriodType INT = NULL,
@PolicyStatusId INT = NULL

AS
BEGIN

DECLARE @MemberNumber VARCHAR(50);
DECLARE @MemberName VARCHAR(50);
DECLARE @ClientTypeDesc VARCHAR(50);
DECLARE @MemberStatus VARCHAR(50);
DECLARE @PolicyNumber VARCHAR(50);
DECLARE @DateCreated VARCHAR(25);
DECLARE @CreatedBy VARCHAR(25);
DECLARE @DateModified VARCHAR(25);
DECLARE @ModifiedBy VARCHAR(50);
DECLARE @Action VARCHAR(50);
DECLARE @NewItem VARCHAR(MAX);
DECLARE @OldItem VARCHAR(MAX);
DECLARE @ContactPerson VARCHAR(100);
DECLARE @PeriodDate DATE = NULL
DECLARE @CreatedByPerson VARCHAR(50);
DECLARE @ModifiedByPerson VARCHAR(50);
DECLARE @rolePlayerIdentificationTypeId INT = NULL; 
DECLARE @Status INT




	
	IF OBJECT_ID('tempdb..##temp_policyAudit') IS NOT NULL DROP TABLE ##temp_policyAudit

	CREATE TABLE ##temp_policyAudit (
		MemberName VARCHAR(50),
		MemberNumber VARCHAR(50),
		ClientType VARCHAR(50),
		MemberStatus VARCHAR(50),
		PolicyNumber VARCHAR(50), 
		ContactPerson VARCHAR(50),
		DateCreated VARCHAR(25),
		CreatedBy VARCHAR(50),
		DateModified VARCHAR(28),
		ModifiedBy VARCHAR(50),
		FieldUpdated VARCHAR(50),
		ValueBefore VARCHAR(50),
		ValueAfter VARCHAR(50),
		CreatedByPerson VARCHAR(50),
		ModifiedByPerson VARCHAR(50));

	IF(@PeriodType IS NOT NULL AND @PeriodType <> 5)
	BEGIN
		SELECT @PeriodDate =
			CASE WHEN @PeriodType = 1 THEN DATEADD(DAY, DATEDIFF(DAY, 0, GETDATE() -0), 0)
				 WHEN @PeriodType = 2 THEN DATEADD(WEEK, DATEDIFF(WEEK, -1, GETDATE()), -1)
				 WHEN @PeriodType = 3 THEN DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) 
				 WHEN @PeriodType = 4 THEN DATEADD(YEAR, DATEDIFF(YEAR, 0, GETDATE()), 0) 
		END
	END

	IF(@ClientTypeId IS NOT NULL)
	BEGIN
		SELECT @rolePlayerIdentificationTypeId =
			CASE WHEN @ClientTypeId = 1 THEN 1
				 WHEN @ClientTypeId = 0 THEN 2
				 WHEN @ClientTypeId = 3 THEN NULL
		END
	END

	IF(@PolicyStatusId IS NOT NULL)
	BEGIN
		SELECT @Status =
			CASE WHEN @PolicyStatusId = 1 THEN 1
				 WHEN @PolicyStatusId = 0 THEN 2
				 WHEN @PolicyStatusId = 3 THEN NULL
		END
	END


	DECLARE cursor_policy CURSOR FOR
		SELECT DISTINCT 
			MemberName = Roleplayer.DisplayName,
			MemberNumber = [FinPayee].FinPayeNumber,
			CASE 
			WHEN [Roleplayer].RolePlayerIdentificationTypeId = 2 THEN 'Company'
			ELSE 'Individual' END AS ClientType,
			(SELECT CASE WHEN COUNT(*) > 0 THEN 'Active' ELSE 'Active - No policies' END from [policy].[policy] where PolicyOwnerId = roleplayer.RolePlayerId ) as MemberStatus,
			PolicyNumber = JSON_VALUE(NewItem,'$.PolicyNumber'),
			DateCreated = JSON_VALUE(NewItem,'$.CreatedDate'),
			CreatedBy = JSON_VALUE(NewItem,'$.CreatedBy'),
			ModifiedBy = JSON_VALUE(NewItem,'$.ModifiedBy'),
		    ModifiedDate = JSON_VALUE(NewItem,'$.ModifiedDate'),
			[AUDIT].[Action],
			[AUDIT].[NewItem],
			[AUDIT].[OldItem],
			[audit].ItemType,
			[User].DisplayName AS CreatedByPerson,
		    ModifiedByPerson = (SELECT [User].DisplayName FROM [security].[User] WHERE [User].Email = JSON_VALUE(NewItem,'$.ModifiedBy'))
		FROM [audit].[AuditLog] [AUDIT]
		INNER JOIN [Client].[RolePlayer] [Roleplayer] ON [Roleplayer].RolePlayerId = JSON_VALUE(NewItem,'$.PolicyOwnerId')
		LEFT JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = [Roleplayer].RolePlayerId
		LEFT JOIN [Client].[Person] [Person] ON [Person].RolePlayerId = [Roleplayer].RolePlayerId
		LEFT JOIN [Client].[RolePlayerAddress] [Address] ON [Address].RolePlayerId = [Roleplayer].RolePlayerId
		LEFT JOIN [Client].[RolePlayerContact] [Contact] ON [Contact].RolePlayerId = [Roleplayer].RolePlayerId
		LEFT JOIN [Client].[RolePlayerBankingDetails] [Bank] ON [Bank].RolePlayerId = [Roleplayer].RolePlayerId
		LEFT JOIN [Client].[FinPayee] [FinPayee] ON [FinPayee].RolePlayerId = [Roleplayer].RolePlayerId
		LEFT JOIN [policy].[Policy] [policy] ON [policy].PolicyOwnerId = [Roleplayer].RolePlayerId
		INNER JOIN [security].[User][User] ON [User].Email = JSON_VALUE(NewItem,'$.CreatedBy') 
		WHERE ItemType = 'policy_Policy'
		AND	(@rolePlayerIdentificationTypeId  IS NULL OR [Roleplayer].[RolePlayerIdentificationTypeId] = @rolePlayerIdentificationTypeId ) 
		AND (@StartDate IS NULL OR CONVERT(datetime2,(JSON_VALUE(NewItem,'$.CreatedDate')),111)   >= @StartDate  AND CONVERT(datetime2,(JSON_VALUE(NewItem,'$.CreatedDate')),111) <= CONVERT(datetime2, CONVERT(VARCHAR(11),@EndDate, 111 ) + ' 23:59:59', 111))
		AND (@PeriodDate  IS NULL OR CONVERT(datetime2,(JSON_VALUE(NewItem,'$.CreatedDate')),111) >= @PeriodDate )
		AND (@Status IS NULL OR JSON_VALUE(NewItem,'$.PolicyStatus') = CAST( @Status AS VARCHAR))
	


	OPEN cursor_policy;
	FETCH NEXT FROM cursor_policy INTO 
    @MemberName, 
    @MemberNumber,
	@ClientTypeDesc,
	@MemberStatus,
	@PolicyNumber,
	@DateCreated,
	@CreatedBy,
	@ModifiedBy,
	@DateModified,
	@Action,
	@NewItem,
	@OldItem,
	@ContactPerson,
	@CreatedByPerson,
	@ModifiedByPerson

	WHILE @@FETCH_STATUS = 0
		BEGIN
				IF @Action = 'Modified' 
				BEGIN
					
					IF JSON_VALUE(@NewItem,'$.PaymentFrequency') <> JSON_VALUE(@OldItem,'$.PaymentFrequency') 
					BEGIN
						 DECLARE @PaymentFrequencyBefore NVARCHAR(20) = (SELECT [PaymentFrequency].[Name] FROM [common].[PaymentFrequency] WHERE [PaymentFrequency].[Id] = CAST(JSON_VALUE(@OldItem,'$.PaymentFrequency') AS INT));
						  DECLARE @PaymentFrequencyAfter NVARCHAR(20) = (SELECT [PaymentFrequency].[Name] FROM [common].[PaymentFrequency] WHERE [PaymentFrequency].[Id] = CAST(JSON_VALUE(@NewItem,'$.PaymentFrequency') AS INT));

						 IF NOT EXISTS(SELECT * FROM ##temp_policyAudit WHERE MemberNumber = @MemberNumber	AND PolicyNumber = @PolicyNumber 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Payment Frequency' AND ValueBefore = @PaymentFrequencyBefore
																   AND ValueAfter = @PaymentFrequencyAfter)
						 BEGIN
							 INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,CreatedByPerson,ModifiedByPerson)
								VALUES(@MemberNumber, @PolicyNumber,@MemberStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Payment Frequency', @PaymentFrequencyBefore, @PaymentFrequencyAfter,@ContactPerson,@CreatedByPerson,@ModifiedByPerson)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.PaymentMethod') <> JSON_VALUE(@OldItem,'$.PaymentMethod') 
					BEGIN

					 DECLARE @PaymentMethodBefore NVARCHAR(20) = (SELECT [PaymentMethod].[Name] FROM [common].[PaymentMethod] WHERE [PaymentMethod].[Id] = CAST(JSON_VALUE(@OldItem,'$.PaymentMethod') AS INT));
					 DECLARE @PaymentMethodAfter NVARCHAR(20) = (SELECT [PaymentMethod].[Name] FROM [common].[PaymentMethod] WHERE [PaymentMethod].[Id] = CAST(JSON_VALUE(@NewItem,'$.PaymentMethod') AS INT));

						IF NOT EXISTS(SELECT * FROM ##temp_policyAudit WHERE MemberNumber = @MemberNumber	AND PolicyNumber = @PolicyNumber 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Payment Method' AND ValueBefore = @PaymentMethodBefore
																   AND ValueAfter = @PaymentMethodAfter)
							 BEGIN
							 INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,CreatedByPerson,ModifiedByPerson)
								VALUES(@MemberNumber, @PolicyNumber,@MemberStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Payment Method', @PaymentMethodBefore, @PaymentMethodAfter,@ContactPerson,@CreatedByPerson,@ModifiedByPerson)
							 END

					END

					IF JSON_VALUE(@NewItem,'$.PolicyInceptionDate') <> JSON_VALUE(@OldItem,'$.PolicyInceptionDate') 
					BEGIN					
							 IF NOT EXISTS(SELECT * FROM ##temp_policyAudit WHERE MemberNumber = @MemberNumber	AND PolicyNumber = @PolicyNumber 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Policy Inception Date' AND ValueBefore = FORMAT ( CAST(JSON_VALUE(@OldItem,'$.PolicyInceptionDate') AS datetime), 'dd-MM-yyyy ') 
																   AND ValueAfter = FORMAT (CAST( JSON_VALUE(@NewItem,'$.PolicyInceptionDate') AS datetime), 'dd-MM-yyyy')  )
							 BEGIN
								INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,CreatedByPerson,ModifiedByPerson)
									VALUES(@MemberNumber, @PolicyNumber,@MemberStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Policy Inception Date', FORMAT ( CAST(JSON_VALUE(@OldItem,'$.PolicyInceptionDate') AS datetime), 'dd-MM-yyyy ')   , FORMAT (CAST( JSON_VALUE(@NewItem,'$.PolicyInceptionDate') AS datetime), 'dd-MM-yyyy ')  ,@ContactPerson,@CreatedByPerson,@ModifiedByPerson)
							 END						 
					END

					IF JSON_VALUE(@NewItem,'$.ExpiryDate') <> JSON_VALUE(@OldItem,'$.ExpiryDate') 
					BEGIN
							 IF NOT EXISTS(SELECT * FROM ##temp_policyAudit WHERE MemberNumber = @MemberNumber	AND PolicyNumber = @PolicyNumber 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Expiry Date' AND ValueBefore = FORMAT ( CAST(JSON_VALUE(@OldItem,'$.ExpiryDate') AS datetime), 'dd-MM-yyyy') 
																   AND ValueAfter = FORMAT (CAST( JSON_VALUE(@NewItem,'$.ExpiryDate') AS datetime), 'dd-MM-yyyy ')  )
							BEGIN
								INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,CreatedByPerson,ModifiedByPerson)
									VALUES(@MemberNumber, @PolicyNumber,@MemberStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Expiry Date',  FORMAT ( CAST(JSON_VALUE(@OldItem,'$.ExpiryDate') AS datetime), 'dd-MM-yyyy')  , FORMAT (CAST( JSON_VALUE(@NewItem,'$.ExpiryDate') AS datetime), 'dd-MM-yyyy ') ,@ContactPerson,@CreatedByPerson,@ModifiedByPerson)
							 END
	 
					END

					IF JSON_VALUE(@NewItem,'$.CancellationDate') <> JSON_VALUE(@OldItem,'$.CancellationDate') 
					BEGIN
							IF NOT EXISTS(SELECT * FROM ##temp_policyAudit WHERE MemberNumber = @MemberNumber	AND PolicyNumber = @PolicyNumber 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Cancellation Date' AND ValueBefore = FORMAT ( CAST(JSON_VALUE(@OldItem,'$.CancellationDate') AS datetime), 'dd-MM-yyyy') 
																   AND ValueAfter = FORMAT (CAST( JSON_VALUE(@NewItem,'$.CancellationDate') AS datetime), 'dd-MM-yyyy ')  )
								BEGIN
								INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,CreatedByPerson,ModifiedByPerson)
									VALUES(@MemberNumber, @PolicyNumber,@MemberStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Cancellation Date', FORMAT ( CAST(JSON_VALUE(@OldItem,'$.CancellationDate') AS datetime), 'dd-MM-yyyy')  , FORMAT (CAST( JSON_VALUE(@NewItem,'$.CancellationDate') AS datetime), 'dd-MM-yyyy ') ,@ContactPerson,@CreatedByPerson,@ModifiedByPerson)
							 END

						 
					END

					IF JSON_VALUE(@NewItem,'$.FirstInstallmentDate') <> JSON_VALUE(@OldItem,'$.FirstInstallmentDate') 
					BEGIN
							IF NOT EXISTS(SELECT * FROM ##temp_policyAudit WHERE MemberNumber = @MemberNumber	AND PolicyNumber = @PolicyNumber 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'First Installment Date' AND ValueBefore = FORMAT ( CAST(JSON_VALUE(@OldItem,'$.FirstInstallmentDate') AS datetime), 'dd-MM-yyyy ') 
																   AND ValueAfter = FORMAT (CAST( JSON_VALUE(@NewItem,'$.FirstInstallmentDate') AS datetime), 'dd-MM-yyyy')  )
								BEGIN
								INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,CreatedByPerson,ModifiedByPerson)
									VALUES(@MemberNumber, @PolicyNumber,@MemberStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'First Installment Date', FORMAT ( CAST(JSON_VALUE(@OldItem,'$.FirstInstallmentDate') AS datetime), 'dd-MM-yyyy ')  , FORMAT (CAST( JSON_VALUE(@NewItem,'$.FirstInstallmentDate') AS datetime), 'dd-MM-yyyy') ,@ContactPerson,@CreatedByPerson,@ModifiedByPerson)
							 END

						 
					END

					IF JSON_VALUE(@NewItem,'$.LastInstallmentDate') <> JSON_VALUE(@OldItem,'$.LastInstallmentDate') 
					BEGIN
							IF NOT EXISTS(SELECT * FROM ##temp_policyAudit WHERE MemberNumber = @MemberNumber	AND PolicyNumber = @PolicyNumber 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Last Installment Date' AND ValueBefore = convert(varchar, JSON_VALUE(@OldItem,'$.LastInstallmentDate'), 103) 
																   AND ValueAfter = convert(varchar, JSON_VALUE(@NewItem,'$.LastInstallmentDate'), 103))
								BEGIN
								INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,CreatedByPerson,ModifiedByPerson)
									VALUES(@MemberNumber, @PolicyNumber,@MemberStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Last Installment Date', FORMAT ( CAST(JSON_VALUE(@OldItem,'$.LastInstallmentDate') AS datetime), 'dd-MM-yyyy ')  , FORMAT (CAST( JSON_VALUE(@NewItem,'$.LastInstallmentDate') AS datetime), 'dd-MM-yyyy'),@ContactPerson,@CreatedByPerson,@ModifiedByPerson)
							 END

						 
					END

					IF JSON_VALUE(@NewItem,'$.RegularInstallmentDayOfMonth') <> JSON_VALUE(@OldItem,'$.RegularInstallmentDayOfMonth') 
					BEGIN
							IF NOT EXISTS(SELECT * FROM ##temp_policyAudit WHERE MemberNumber = @MemberNumber	AND PolicyNumber = @PolicyNumber 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Regular Installment Day Of Month' AND ValueBefore = JSON_VALUE(@OldItem,'$.RegularInstallmentDayOfMonth')
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.RegularInstallmentDayOfMonth'))
							 BEGIN
								INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,CreatedByPerson,ModifiedByPerson)
									VALUES(@MemberNumber, @PolicyNumber,@MemberStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Regular Installment Day Of Month', JSON_VALUE(@OldItem,'$.RegularInstallmentDayOfMonth'), JSON_VALUE(@NewItem,'$.RegularInstallmentDayOfMonth'),@ContactPerson,@CreatedByPerson,@ModifiedByPerson)
							 END
					END

					IF JSON_VALUE(@NewItem,'$.DecemberInstallmentDayOfMonth') <> JSON_VALUE(@OldItem,'$.DecemberInstallmentDayOfMonth') 
					BEGIN
							IF NOT EXISTS(SELECT * FROM ##temp_policyAudit WHERE MemberNumber = @MemberNumber	AND PolicyNumber = @PolicyNumber 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'December Installment Day Of Month' AND ValueBefore = JSON_VALUE(@OldItem,'$.DecemberInstallmentDayOfMonth')
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.DecemberInstallmentDayOfMonth'))
							 BEGIN
								INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,CreatedByPerson,ModifiedByPerson)
									VALUES(@MemberNumber, @PolicyNumber,@MemberStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'December Installment Day Of Month', JSON_VALUE(@OldItem,'$.DecemberInstallmentDayOfMonth'), JSON_VALUE(@NewItem,'$.DecemberInstallmentDayOfMonth'),@ContactPerson,@CreatedByPerson,@ModifiedByPerson)
							 END
					END

					IF JSON_VALUE(@NewItem,'$.PolicyStatus') <> JSON_VALUE(@OldItem,'$.PolicyStatus') 
					BEGIN

						  DECLARE @PolicyStatusBefore NVARCHAR(20) = (SELECT PolicyStatus.[Name] FROM [common].PolicyStatus WHERE PolicyStatus.[Id] = CAST(JSON_VALUE(@OldItem,'$.PolicyStatus') AS INT));
						  DECLARE @PolicyStatusAfter NVARCHAR(20) = (SELECT PolicyStatus.[Name] FROM [common].PolicyStatus WHERE PolicyStatus.[Id] = CAST(JSON_VALUE(@NewItem,'$.PolicyStatus') AS INT));

							IF NOT EXISTS(SELECT * FROM ##temp_policyAudit WHERE MemberNumber = @MemberNumber	AND PolicyNumber = @PolicyNumber 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Policy Status' AND ValueBefore = @PolicyStatusBefore
																   AND ValueAfter = @PolicyStatusAfter)
							 BEGIN
								INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,CreatedByPerson,ModifiedByPerson)
									VALUES(@MemberNumber, @PolicyNumber,@MemberStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Policy Status', @PolicyStatusBefore, @PolicyStatusAfter,@ContactPerson,@CreatedByPerson,@ModifiedByPerson)
							 END
					END

					
					IF JSON_VALUE(@NewItem,'$.AnnualPremium') <> JSON_VALUE(@OldItem,'$.AnnualPremium') 
					BEGIN
							IF NOT EXISTS(SELECT * FROM ##temp_policyAudit WHERE MemberNumber = @MemberNumber	AND PolicyNumber = @PolicyNumber 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Annual Premium' AND ValueBefore = JSON_VALUE(@OldItem,'$.AnnualPremium')
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.AnnualPremium'))
							 BEGIN
								INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,CreatedByPerson,ModifiedByPerson)
									VALUES(@MemberNumber, @PolicyNumber,@MemberStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Annual Premium', JSON_VALUE(@OldItem,'$.AnnualPremium'), JSON_VALUE(@NewItem,'$.AnnualPremium'),@ContactPerson,@CreatedByPerson,@ModifiedByPerson)
							 END
					END

					IF JSON_VALUE(@NewItem,'$.InstallmentPremium') <> JSON_VALUE(@OldItem,'$.InstallmentPremium') 
					BEGIN
							IF NOT EXISTS(SELECT * FROM ##temp_policyAudit WHERE MemberNumber = @MemberNumber	AND PolicyNumber = @PolicyNumber 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Installment Premium' AND ValueBefore = JSON_VALUE(@OldItem,'$.InstallmentPremium')
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.InstallmentPremium'))
							 BEGIN
								INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,CreatedByPerson,ModifiedByPerson)
									VALUES(@MemberNumber, @PolicyNumber,@MemberStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Installment Premium', JSON_VALUE(@OldItem,'$.InstallmentPremium'), JSON_VALUE(@NewItem,'$.InstallmentPremium'),@ContactPerson,@CreatedByPerson,@ModifiedByPerson)
							 END
					END

					IF JSON_VALUE(@NewItem,'$.CommissionPercentage') <> JSON_VALUE(@OldItem,'$.CommissionPercentage') 
					BEGIN
							IF NOT EXISTS(SELECT * FROM ##temp_policyAudit WHERE MemberNumber = @MemberNumber	AND PolicyNumber = @PolicyNumber 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Commission Percentage' AND ValueBefore = JSON_VALUE(@OldItem,'$.CommissionPercentage')
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.CommissionPercentage'))
							 BEGIN
								INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,CreatedByPerson,ModifiedByPerson)
									VALUES(@MemberNumber, @PolicyNumber,@MemberStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Commission Percentage', JSON_VALUE(@OldItem,'$.CommissionPercentage'), JSON_VALUE(@NewItem,'$.CommissionPercentage'),@ContactPerson,@CreatedByPerson,@ModifiedByPerson)
							 END
					END

		

	
				END	
				ELSE
				BEGIN
					
					IF NOT EXISTS (SELECT * FROM ##temp_policyAudit WHERE PolicyNumber = @PolicyNumber) 
					BEGIN
						INSERT INTO ##temp_policyAudit (MemberNumber, PolicyNumber,MemberName,MemberStatus, ClientType, DateCreated, CreatedBy,ContactPerson,DateModified,CreatedByPerson,ModifiedByPerson,FieldUpdated, ValueBefore, ValueAfter)
							VALUES(@MemberNumber, @PolicyNumber, @MemberName,@MemberStatus, @ClientTypeDesc, @DateCreated, @CreatedBy,@ContactPerson,@DateCreated,@CreatedByPerson,@ModifiedByPerson,'First entry','First entry','First entry')
					END
					
				
				END

				FETCH NEXT FROM cursor_policy INTO 
			    @MemberName, 
			    @MemberNumber,
			    @ClientTypeDesc,
				@MemberStatus,
			    @PolicyNumber,
			    @DateCreated,
				@CreatedBy,
				@ModifiedBy,
				@DateModified,
				@Action,
				@NewItem,
				@OldItem,
				@ContactPerson,
				@CreatedByPerson,
				@ModifiedByPerson

		END

		CLOSE cursor_policy;

		DEALLOCATE cursor_policy;

		SELECT  * FROM ##temp_policyAudit;
END

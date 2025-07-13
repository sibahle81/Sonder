

------ =============================================
------ Author:Mbali Mkhize
------ Create date: 2021/06/01
------ EXEC [policy].[PolicyAuditReport] '2021-08-1', '2021-08-10',NULL
------ =============================================
CREATE PROCEDURE [policy].[PolicyAuditReport]
	@StartDate AS DATE,
	@EndDate AS DATE,
    @PolicyNumber AS VARCHAR(50)
AS
BEGIN

--declare @StartDate AS DATE,
--	@EndDate AS DATE
--	set @StartDate ='2021-06-1';
--	set @EndDate ='2021-06-10';

	IF OBJECT_ID(N'tempdb..#TempAuditLog', N'U') IS NOT NULL
			DROP TABLE #TempAuditLog;

		SELECT DISTINCT
			[ID] AS [AuditID],
			[ItemID],
			[Username] AS [User],
			[Action] AS [Action],
			Replace(Replace(Replace(Replace(Replace([NewItem],'"',''),'{',''),'','}'),'[]',''),'}','') AS [NewItem],
			Replace(Replace(Replace(Replace(Replace([OldItem],'"',''),'{',''),'','}'),'[]',''),'}','') AS [OldItem],
			[Date] AS [Date]


		INTO #TempAuditLog 
		FROM [audit].[AuditLog]
		WHERE ([ItemType] = 'Policy_Policy')
		AND ([Date] BETWEEN @StartDate AND @EndDate)

	IF OBJECT_ID(N'tempdb..#TempPolicy', N'U') IS NOT NULL
	DROP TABLE #TempPolicy;

		SELECT *
		INTO #TempPolicy
		FROM [policy].[policy] p
		WHERE ([PolicyId] IN (SELECT DISTINCT [ItemID] FROM #TempAuditLog))
		AND p.PolicyNumber = @PolicyNumber

--New Records

	IF OBJECT_ID(N'tempdb..#TempAudit', N'U') IS NOT NULL
		DROP TABLE #TempAudit;

		SELECT  
			[AuditID],ItemId,[Action],[User],[Date],Benefits,Brokerage,JuristicRepresentative,PolicyBrokers,PolicyInsuredLives,PolicyInvoices,PolicyMovement,PolicyNotes,
			PolicyPayee,PolicyOwner,ProductOption,Representative,PolicyId,BrokerageId,ProductOptionId,RepresentativeId,JuristicRepresentativeId,PolicyOwnerId,
			PolicyPayeeId,PaymentFrequency,PaymentMethod,PolicyNumber,PolicyInceptionDate,ExpiryDate,CancellationDate,FirstInstallmentDate,LastInstallmentDate,
			RegularInstallmentDayOfMonth,DecemberInstallmentDayOfMonth,PolicyStatus,AnnualPremium,InstallmentPremium,CommissionPercentage,IsDeleted,CreatedBy,
			CreatedDate,ModifiedBy,ModifiedDate,AdminPercentage,PolicyCancelReason,ClientReference,LastLapsedDate,LapsedCount,LastReinstateDate,PolicyMovementId,
			PolicyPauseDate,CanLapse 
			INTO #TempAudit
		FROM ( 
		 SELECT [AuditID],ItemId,[Action],[User],[Date],
		  substring(Split.value,charindex(':',Split.value)-50,50) as [value1],
		  substring(Split.value,charindex(':',Split.value)+1,50) as [value]
		 FROM #TempAuditLog AS tmpAudit 
		 CROSS APPLY String_split([NewItem],',') AS Split) 
		 AS tbl
		Pivot (Max(Value) FOR [value1] IN (Benefits,Brokerage,JuristicRepresentative,PolicyBrokers,PolicyInsuredLives,PolicyInvoices,PolicyMovement,PolicyNotes,
			PolicyPayee,PolicyOwner,ProductOption,Representative,PolicyId,BrokerageId,ProductOptionId,RepresentativeId,JuristicRepresentativeId,PolicyOwnerId,
			PolicyPayeeId,PaymentFrequency,PaymentMethod,PolicyNumber,PolicyInceptionDate,ExpiryDate,CancellationDate,FirstInstallmentDate,LastInstallmentDate,
			RegularInstallmentDayOfMonth,DecemberInstallmentDayOfMonth,PolicyStatus,AnnualPremium,InstallmentPremium,CommissionPercentage,IsDeleted,CreatedBy,
			CreatedDate,ModifiedBy,ModifiedDate,AdminPercentage,PolicyCancelReason,ClientReference,LastLapsedDate,LapsedCount,LastReinstateDate,PolicyMovementId,
			PolicyPauseDate,CanLapse)
		) AS Pvt

--Old Records

	IF OBJECT_ID(N'tempdb..#TempAuditOld', N'U') IS NOT NULL
		DROP TABLE #TempAuditOld;

		SELECT  
			[AuditID],ItemId,[Action],[User],[Date],Benefits,Brokerage,JuristicRepresentative,PolicyBrokers,PolicyInsuredLives,PolicyInvoices,PolicyMovement,PolicyNotes,
			PolicyPayee,PolicyOwner,ProductOption,Representative,PolicyId,BrokerageId,ProductOptionId,RepresentativeId,JuristicRepresentativeId,PolicyOwnerId,
			PolicyPayeeId,PaymentFrequency,PaymentMethod,PolicyNumber,PolicyInceptionDate,ExpiryDate,CancellationDate,FirstInstallmentDate,LastInstallmentDate,
			RegularInstallmentDayOfMonth,DecemberInstallmentDayOfMonth,PolicyStatus,AnnualPremium,InstallmentPremium,CommissionPercentage,IsDeleted,CreatedBy,
			CreatedDate,ModifiedBy,ModifiedDate,AdminPercentage,PolicyCancelReason,ClientReference,LastLapsedDate,LapsedCount,LastReinstateDate,PolicyMovementId,
			PolicyPauseDate,CanLapse 
			INTO #TempAuditOld
		FROM ( 
		 SELECT [AuditID],ItemId,[Action],[User],[Date],
		  substring(Split.value,charindex(':',Split.value)-50,50) as [value1],
		  substring(Split.value,charindex(':',Split.value)+1,50) as [value]
		 FROM #TempAuditLog AS tmpAudit 
		 CROSS APPLY String_split([OldItem],',') AS Split) 
		 AS tbl
		Pivot (Max(Value) FOR [value1] IN (Benefits,Brokerage,JuristicRepresentative,PolicyBrokers,PolicyInsuredLives,PolicyInvoices,PolicyMovement,PolicyNotes,
			PolicyPayee,PolicyOwner,ProductOption,Representative,PolicyId,BrokerageId,ProductOptionId,RepresentativeId,JuristicRepresentativeId,PolicyOwnerId,
			PolicyPayeeId,PaymentFrequency,PaymentMethod,PolicyNumber,PolicyInceptionDate,ExpiryDate,CancellationDate,FirstInstallmentDate,LastInstallmentDate,
			RegularInstallmentDayOfMonth,DecemberInstallmentDayOfMonth,PolicyStatus,AnnualPremium,InstallmentPremium,CommissionPercentage,IsDeleted,CreatedBy,
			CreatedDate,ModifiedBy,ModifiedDate,AdminPercentage,PolicyCancelReason,ClientReference,LastLapsedDate,LapsedCount,LastReinstateDate,PolicyMovementId,
			PolicyPauseDate,CanLapse)
		) AS Pvt
		--Final Select

	IF OBJECT_ID(N'tempdb..#FinalAudit', N'U') IS NOT NULL
		DROP TABLE #FinalAudit;

		SELECT distinct tmpa.AuditID,
				tmpa.ItemId,tmpa.[Action],tmpa.[User],tmpa.[Date],tmpa.Benefits,
				tmpa.Brokerage,tmpao.Brokerage AS OldBrokerage,
				CASE WHEN tmpa.Brokerage <> tmpao.Brokerage THEN 'NEW Brokerage :' + tmpa.Brokerage   ELSE 'Nothin' END AS BrokerageChange,
				tmpa.JuristicRepresentative,tmpao.JuristicRepresentative AS OldJuristicRepresentative,
				CASE WHEN tmpa.JuristicRepresentative <> tmpao.JuristicRepresentative THEN 'NEW JuristicRepresentative :' + tmpa.JuristicRepresentative   ELSE 'Nothin' END AS JuristicRepresentativeChange,
				tmpa.PolicyBrokers,tmpao.PolicyBrokers AS OldPolicyBrokers,
				CASE WHEN tmpa.PolicyBrokers <> tmpao.PolicyBrokers THEN 'NEW PolicyBrokers :' + tmpa.PolicyBrokers   ELSE 'Nothin' END AS PolicyBrokersChange,
				tmpa.PolicyInsuredLives,tmpao.PolicyInsuredLives AS OldPolicyInsuredLives,
				CASE WHEN tmpa.PolicyInsuredLives <> tmpao.PolicyInsuredLives THEN 'NEW PolicyInsuredLives :' + tmpa.PolicyInsuredLives   ELSE 'Nothin' END AS PolicyInsuredLivesChange,
				tmpa.PolicyInvoices,tmpao.PolicyInvoices AS OldPolicyInvoices,
				CASE WHEN tmpa.PolicyInvoices <> tmpao.PolicyInvoices THEN 'NEW PolicyInvoices :' + tmpa.PolicyInvoices   ELSE 'Nothin' END AS PolicyInvoicesChange,
				tmpa.PolicyMovement,tmpao.PolicyMovement AS OldPolicyMovement,
				CASE WHEN tmpa.PolicyMovement <> tmpao.PolicyMovement THEN 'NEW PolicyMovement :' + tmpa.PolicyMovement   ELSE 'Nothin' END AS PolicyMovementChange,
				--tmpa.PolicyNotes,tmpao.PolicyNotes AS OldPolicyNotes,
				----CASE WHEN tmpa.JuristicRepresentative <> tmpao.JuristicRepresentative THEN 'NEW JuristicRepresentative :' + tmpa.JuristicRepresentative   ELSE 'Nothin' END AS JuristicRepresentativeChange,
				----tmpa.PolicyPayee,tmpao.PolicyPayee AS OldPolicyPayee,
				----CASE WHEN tmpa.JuristicRepresentative <> tmpao.JuristicRepresentative THEN 'NEW JuristicRepresentative :' + tmpa.JuristicRepresentative   ELSE 'Nothin' END AS JuristicRepresentativeChange,
				----tmpa.PolicyOwner,tmpao.PolicyOwner AS OldPolicyOwner,
				----CASE WHEN tmpa.JuristicRepresentative <> tmpao.JuristicRepresentative THEN 'NEW JuristicRepresentative :' + tmpa.JuristicRepresentative   ELSE 'Nothin' END AS JuristicRepresentativeChange,
				----tmpa.ProductOption,tmpao.ProductOption AS OldProductOption,
				----CASE WHEN tmpa.JuristicRepresentative <> tmpao.JuristicRepresentative THEN 'NEW JuristicRepresentative :' + tmpa.JuristicRepresentative   ELSE 'Nothin' END AS JuristicRepresentativeChange,
				tmpa.Representative,tmpao.Representative AS OldRepresentative,
				CASE WHEN tmpa.Representative <> tmpao.Representative THEN 'NEW Representative :' + tmpa.Representative   ELSE 'Nothin' END AS RepresentativeChange,
				tmpa.BrokerageId,tmpao.BrokerageId AS OldBrokerageId,
				CASE WHEN tmpa.BrokerageId <> tmpao.BrokerageId THEN 'NEW BrokerageId :' + tmpa.BrokerageId   ELSE 'Nothin' END AS BrokerageIdChange,
				tmpa.ProductOptionId,tmpao.ProductOptionId AS OldProductOptionId,
				CASE WHEN tmpa.ProductOptionId <> tmpao.ProductOptionId THEN 'NEW ProductOptionId :' + tmpa.ProductOptionId   ELSE 'Nothin' END AS ProductOptionIdChange,
				tmpa.RepresentativeId,tmpao.RepresentativeId AS OldRepresentativeId,
				CASE WHEN tmpa.RepresentativeId <> tmpao.RepresentativeId THEN 'NEW RepresentativeId :' + tmpa.RepresentativeId   ELSE 'Nothin' END AS RepresentativeIdChange,
				tmpa.JuristicRepresentativeId,tmpao.JuristicRepresentativeId AS OldJuristicRepresentativeId,
				CASE WHEN tmpa.JuristicRepresentativeId <> tmpao.JuristicRepresentativeId THEN 'NEW JuristicRepresentativeId :' + tmpa.JuristicRepresentativeId   ELSE 'Nothin' END AS JuristicRepresentativeIdChange,
				tmpa.PolicyOwnerId,tmpao.PolicyOwnerId AS OldPolicyOwnerId,
				CASE WHEN tmpa.PolicyOwnerId <> tmpao.PolicyOwnerId THEN 'NEW PolicyOwnerId :' + tmpa.PolicyOwnerId   ELSE 'Nothin' END AS PolicyOwnerIdChange,
				tmpa.PolicyPayeeId,tmpao.PolicyPayeeId AS OldPolicyPayeeId,
				CASE WHEN tmpa.PolicyPayeeId <> tmpao.PolicyPayeeId THEN 'NEW PolicyPayeeId :' + tmpa.PolicyPayeeId   ELSE 'Nothin' END AS PolicyPayeeIdChange,
				tmpa.PaymentFrequency,tmpao.PaymentFrequency AS OldPaymentFrequency,
				CASE WHEN tmpa.PaymentFrequency <> tmpao.PaymentFrequency THEN 'NEW PaymentFrequency :' + tmpa.PaymentFrequency   ELSE 'Nothin' END AS PaymentFrequencyChange,
				tmpa.PaymentMethod,tmpao.PaymentMethod AS OldPaymentMethod,
				CASE WHEN tmpa.PaymentMethod <> tmpao.PaymentMethod THEN 'NEW PaymentMethod :' + tmpa.PaymentMethod   ELSE 'Nothin' END AS PaymentMethodChange,
				tmpa.PolicyNumber,tmpao.PolicyNumber AS OldPolicyNumber,
				CASE WHEN tmpa.PolicyNumber <> tmpao.PolicyNumber THEN 'NEW PolicyNumber :' + tmpa.PolicyNumber   ELSE 'Nothin' END AS PolicyNumberChange,
				----CASE WHEN tmpa.JuristicRepresentative <> tmpao.JuristicRepresentative THEN 'NEW JuristicRepresentative :' + tmpa.JuristicRepresentative   ELSE 'Nothin' END AS JuristicRepresentativeChange,
				tmpa.PolicyInceptionDate,tmpao.PolicyInceptionDate AS OldPolicyInceptionDate,
				CASE WHEN tmpa.PolicyInceptionDate <> tmpao.PolicyInceptionDate THEN 'NEW PolicyInceptionDate :' + tmpa.PolicyInceptionDate   ELSE 'Nothin' END AS PolicyInceptionDateChange,
				tmpa.ExpiryDate,tmpao.ExpiryDate AS OldExpiryDate,
				CASE WHEN tmpa.ExpiryDate <> tmpao.ExpiryDate THEN 'NEW ExpiryDate :' + tmpa.ExpiryDate   ELSE 'Nothin' END AS ExpiryDateChange,
				tmpa.CancellationDate,tmpao.CancellationDate AS OldCancellationDate,
				CASE WHEN tmpa.CancellationDate <> tmpao.CancellationDate THEN 'NEW CancellationDate :' + tmpa.CancellationDate   ELSE 'Nothin' END AS CancellationDateChange,
				tmpa.FirstInstallmentDate,tmpao.FirstInstallmentDate AS OldFirstInstallmentDate,
				CASE WHEN tmpa.FirstInstallmentDate <> tmpao.FirstInstallmentDate THEN 'NEW FirstInstallmentDate :' + tmpa.FirstInstallmentDate   ELSE 'Nothin' END AS FirstInstallmentDateChange,
				tmpa.LastInstallmentDate,tmpao.LastInstallmentDate AS OldLastInstallmentDate,
				CASE WHEN tmpa.LastInstallmentDate <> tmpao.LastInstallmentDate THEN 'NEW LastInstallmentDate :' + tmpa.LastInstallmentDate   ELSE 'Nothin' END AS LastInstallmentDateChange,
				tmpa.RegularInstallmentDayOfMonth,tmpao.RegularInstallmentDayOfMonth AS OldRegularInstallmentDayOfMonth,
				CASE WHEN tmpa.RegularInstallmentDayOfMonth <> tmpao.RegularInstallmentDayOfMonth THEN 'NEW RegularInstallmentDayOfMonth :' + tmpa.RegularInstallmentDayOfMonth   ELSE 'Nothin' END AS RegularInstallmentDayOfMonthChange,
				tmpa.DecemberInstallmentDayOfMonth,tmpao.DecemberInstallmentDayOfMonth AS OldDecemberInstallmentDayOfMonth,
				CASE WHEN tmpa.DecemberInstallmentDayOfMonth <> tmpao.DecemberInstallmentDayOfMonth THEN 'NEW DecemberInstallmentDayOfMonth :' + tmpa.DecemberInstallmentDayOfMonth   ELSE 'Nothin' END AS DecemberInstallmentDayOfMonthChange,
				tmpa.PolicyStatus,tmpao.PolicyStatus AS OldPolicyStatus,
				CASE WHEN tmpa.PolicyStatus <> tmpao.PolicyStatus THEN 'NEW PolicyStatus :' + tmpa.PolicyStatus   ELSE 'Nothin' END AS PolicyStatusChange,
				tmpa.AnnualPremium,tmpao.AnnualPremium AS OldAnnualPremium,
				CASE WHEN tmpa.AnnualPremium <> tmpao.AnnualPremium THEN 'NEW AnnualPremium :' + tmpa.AnnualPremium   ELSE 'Nothin' END AS AnnualPremiumChange,
				tmpa.InstallmentPremium,tmpao.InstallmentPremium AS OldInstallmentPremium,
				CASE WHEN tmpa.InstallmentPremium <> tmpao.InstallmentPremium THEN 'NEW InstallmentPremium :' + tmpa.InstallmentPremium   ELSE 'Nothin' END AS InstallmentPremiumChange,
				tmpa.CommissionPercentage,tmpao.CommissionPercentage AS OldCommissionPercentage,
				CASE WHEN tmpa.CommissionPercentage <> tmpao.CommissionPercentage THEN 'NEW CommissionPercentage :' + tmpa.CommissionPercentage   ELSE 'Nothin' END AS CommissionPercentageChange,
				tmpa.IsDeleted,tmpao.IsDeleted AS OldIsDeleted,
				CASE WHEN tmpa.IsDeleted <> tmpao.IsDeleted THEN 'NEW IsDeleted :' + tmpa.IsDeleted   ELSE 'Nothin' END AS IsDeletedChange,
				tmpa.CreatedBy,tmpao.CreatedBy AS OldCreatedBy,
				CASE WHEN tmpa.CreatedBy <> tmpao.CreatedBy THEN 'NEW CreatedBy :' + tmpa.CreatedBy   ELSE 'Nothin' END AS CreatedByChange,
				tmpa.CreatedDate,tmpao.CreatedDate AS OldCreatedDate,
				CASE WHEN tmpa.CreatedDate <> tmpao.CreatedDate THEN 'NEW CreatedDate :' + tmpa.CreatedDate   ELSE 'Nothin' END AS CreatedDateChange,
				tmpa.ModifiedBy,tmpao.ModifiedBy AS OldModifiedBy,
				CASE WHEN tmpa.ModifiedBy <> tmpao.ModifiedBy THEN 'NEW ModifiedBy :' + tmpa.ModifiedBy   ELSE 'Nothin' END AS ModifiedByChange,
				tmpa.ModifiedDate,tmpao.ModifiedDate AS OldModifiedDate,
				CASE WHEN tmpa.ModifiedDate <> tmpao.ModifiedDate THEN 'NEW ModifiedDate :' + tmpa.ModifiedDate   ELSE 'Nothin' END AS ModifiedDateChange,
    			tmpa.AdminPercentage ,tmpao.AdminPercentage AS OldAdminPercentage,
				CASE WHEN tmpa.AdminPercentage <> tmpao.AdminPercentage THEN 'NEW AdminPercentage :' + tmpa.AdminPercentage ELSE 'Nothin' END AS AdminPercentageChange,
				tmpa.PolicyCancelReason,tmpao.PolicyCancelReason AS OldPolicyCancelReason,
				CASE WHEN tmpa.PolicyCancelReason <> tmpao.PolicyCancelReason THEN 'NEW PolicyCancelReason :' + tmpa.PolicyCancelReason   ELSE 'Nothin' END AS PolicyCancelReasonChange,
				tmpa.ClientReference,tmpao.ClientReference AS OldClientReference,
				CASE WHEN tmpa.ClientReference <> tmpao.ClientReference THEN 'NEW ClientReference :' + tmpa.ClientReference   ELSE 'Nothin' END AS ClientReferenceChange,
				tmpa.LastLapsedDate,tmpao.LastLapsedDate AS OldLastLapsedDate,
				CASE WHEN tmpa.LastLapsedDate <> tmpao.LastLapsedDate THEN 'NEW LastLapsedDate :' + tmpa.LastLapsedDate   ELSE 'Nothin' END AS LastLapsedDateChange,
				tmpa.LapsedCount,tmpao.LapsedCount AS OldLapsedCount,
				CASE WHEN tmpa.LapsedCount <> tmpao.LapsedCount THEN 'NEW LapsedCount :' + tmpa.LapsedCount   ELSE 'Nothin' END AS LapsedCountChange,
				tmpa.LastReinstateDate,tmpao.LastReinstateDate AS OldLastReinstateDate,
				CASE WHEN tmpa.JuristicRepresentative <> tmpao.LastReinstateDate THEN 'NEW LastReinstateDate :' + tmpa.LastReinstateDate   ELSE 'Nothin' END AS LastReinstateDateChange,
				tmpa.PolicyMovementId,tmpao.PolicyMovementId AS OldPolicyMovementId,
				CASE WHEN tmpa.PolicyMovementId <> tmpao.PolicyMovementId THEN 'NEW PolicyMovementId :' + tmpa.PolicyMovementId   ELSE 'Nothin' END AS PolicyMovementIdChange,
				tmpa.PolicyPauseDate,tmpao.PolicyPauseDate AS OldPolicyPauseDate,
				CASE WHEN tmpa.PolicyPauseDate <> tmpao.PolicyPauseDate THEN 'NEW PolicyPauseDate :' + tmpa.PolicyPauseDate   ELSE 'Nothin' END AS PolicyPauseDateChange,
				tmpa.CanLapse,tmpao.CanLapse AS OldCanLapse,
				CASE WHEN tmpa.CanLapse <> tmpao.CanLapse THEN 'NEW CanLapse :' + tmpa.CanLapse   ELSE 'Nothin' END AS CanLapseChange
				
		INTO #FinalAudit --SELECT *
		FROM #TempAudit tmpa
		LEFT JOIN #TempAuditOld tmpao ON tmpa.ItemID = tmpao.ItemID
		AND tmpa.[AuditID] = tmpao.[AuditID]
		AND  ((tmpao.PolicyNumber = @PolicyNumber or @PolicyNumber IS NULL))
	

		


	IF OBJECT_ID(N'tempdb..#TempFinalAudit', N'U') IS NOT NULL
		DROP TABLE #TempFinalAudit

		SELECT AuditID,ItemId AS ItemId,--tmpa.[Action],tmpa.[User],tmpa.[Date],tmpa.Benefits,
				'Brokerage' As ChangedColumn,Brokerage AS NewColumn ,OldBrokerage AS OldColumn
		INTO #TempFinalAudit FROM #FinalAudit 
		WHERE Brokerage <> OldBrokerage 
		UNION 
		SELECT AuditID,ItemId,'JuristicRepresentative',JuristicRepresentative,OldJuristicRepresentative FROM #FinalAudit
		WHERE JuristicRepresentative <> OldJuristicRepresentative 
		UNION
		SELECT AuditID,ItemId,'PolicyBrokers',PolicyBrokers,OldPolicyBrokers FROM #FinalAudit 
		WHERE PolicyBrokers <> OldPolicyBrokers
		UNION
		SELECT AuditID,ItemId,'PolicyInsuredLives',PolicyInsuredLives,OldPolicyInsuredLives FROM #FinalAudit 
		WHERE PolicyInsuredLives <> OldPolicyInsuredLives
		UNION
		SELECT AuditID,ItemId,'PolicyInvoices',PolicyInvoices,OldPolicyInvoices FROM #FinalAudit
		WHERE PolicyInvoices <> OldPolicyInvoices 
		UNION
		SELECT AuditID,ItemId,'PolicyMovement',PolicyMovement,OldPolicyMovement FROM #FinalAudit 
		WHERE PolicyMovement <> OldPolicyMovement
		UNION
		SELECT AuditID,ItemId,'Representative',Representative,OldRepresentative FROM #FinalAudit 
		WHERE Representative <> OldRepresentative
		UNION
		SELECT AuditID,ItemId,'BrokerageId',BrokerageId,OldBrokerageId FROM #FinalAudit
		WHERE BrokerageId <> OldBrokerageId
		UNION
		SELECT AuditID,ItemId,'ProductOptionId',ProductOptionId,OldProductOptionId FROM #FinalAudit
		WHERE ProductOptionId <> OldProductOptionId
		UNION
		SELECT AuditID,ItemId,'RepresentativeId',RepresentativeId,OldRepresentativeId FROM #FinalAudit
		WHERE RepresentativeId <> OldRepresentativeId 
		UNION
		SELECT AuditID,ItemId,'JuristicRepresentativeId',JuristicRepresentativeId,OldJuristicRepresentativeId FROM #FinalAudit 
		WHERE JuristicRepresentativeId <> OldJuristicRepresentativeId
		UNION
		SELECT AuditID,ItemId,'PolicyOwnerId',PolicyOwnerId,OldPolicyOwnerId FROM #FinalAudit
		WHERE PolicyOwnerId <> OldPolicyOwnerId 
		UNION
		SELECT AuditID,ItemId,'PolicyPayeeId',PolicyPayeeId,OldPolicyPayeeId FROM #FinalAudit 
		WHERE PolicyPayeeId <> OldPolicyPayeeId
		UNION
		SELECT AuditID,ItemId,'PaymentFrequency',PaymentFrequency,OldPaymentFrequency FROM #FinalAudit
		WHERE PaymentFrequency <> OldPaymentFrequency 
		UNION
		SELECT AuditID,ItemId,'PaymentMethod',PaymentMethod,OldPaymentMethod FROM #FinalAudit
		WHERE PaymentMethod <> OldPaymentMethod 
		UNION
		SELECT AuditID,ItemId,'PolicyInceptionDate',PolicyInceptionDate,OldPolicyInceptionDate FROM #FinalAudit 
		WHERE PolicyInceptionDate <> OldPolicyInceptionDate
		UNION
		SELECT AuditID,ItemId,'ExpiryDate',ExpiryDate,OldExpiryDate FROM #FinalAudit 
		WHERE ExpiryDate <> OldExpiryDate
		UNION
		SELECT AuditID,ItemId,'CancellationDate',CancellationDate,OldCancellationDate FROM #FinalAudit
		WHERE CancellationDate <> OldCancellationDate 
		UNION
		SELECT AuditID,ItemId,'FirstInstallmentDate',FirstInstallmentDate,OldFirstInstallmentDate FROM #FinalAudit 
		WHERE FirstInstallmentDate <> OldFirstInstallmentDate
		UNION
		SELECT AuditID,ItemId,'LastInstallmentDate',LastInstallmentDate,OldLastInstallmentDate FROM #FinalAudit 
		WHERE LastInstallmentDate <> OldLastInstallmentDate
		UNION
		SELECT AuditID,ItemId,'RegularInstallmentDayOfMonth',RegularInstallmentDayOfMonth,OldRegularInstallmentDayOfMonth FROM #FinalAudit 
		WHERE RegularInstallmentDayOfMonth <> OldRegularInstallmentDayOfMonth
		UNION
		SELECT AuditID,ItemId,'DecemberInstallmentDayOfMonth',DecemberInstallmentDayOfMonth,OldDecemberInstallmentDayOfMonth FROM #FinalAudit 
		WHERE DecemberInstallmentDayOfMonth <> OldDecemberInstallmentDayOfMonth
		UNION
		SELECT AuditID,ItemId,'PolicyStatus',PolicyStatus, OldPolicyStatus FROM #FinalAudit
		WHERE PolicyStatus <> OldPolicyStatus 
		UNION
		SELECT AuditID,ItemId,'AnnualPremium', AnnualPremium, OldAnnualPremium  FROM #FinalAudit
		WHERE cast(AnnualPremium as money) <> cast(OldAnnualPremium as money)
		UNION
		SELECT AuditID,ItemId,'InstallmentPremium',InstallmentPremium, OldInstallmentPremium FROM #FinalAudit 
		WHERE cast(InstallmentPremium as money) <> cast(OldInstallmentPremium as money)
		UNION
		SELECT AuditID,ItemId,'CommissionPercentage',CommissionPercentage, OldCommissionPercentage  FROM #FinalAudit 
		WHERE cast(CommissionPercentage as decimal (5, 4)) <> cast(OldCommissionPercentage as decimal (5, 4))
		UNION
		SELECT AuditID,ItemId,'IsDeleted',IsDeleted, OldIsDeleted FROM #FinalAudit 
		WHERE IsDeleted <> OldIsDeleted
		UNION
		SELECT AuditID,ItemId,'CreatedBy',CreatedBy, OldCreatedBy FROM #FinalAudit
		WHERE CreatedBy <> OldCreatedBy 
		UNION
		SELECT AuditID,ItemId,'CreatedDate',CreatedDate, OldCreatedDate FROM #FinalAudit
		WHERE CreatedDate <> OldCreatedDate 
		--UNION
		--SELECT ItemId,'ModifiedBy',ModifiedBy, OldModifiedBy FROM #FinalAudit
		--WHERE ModifiedBy <> OldModifiedBy 
		--UNION
		--SELECT ItemId,'ModifiedDate',ModifiedDate, OldModifiedDate FROM #FinalAudit
		--WHERE ModifiedDate <> OldModifiedDate 
		UNION
		SELECT AuditID,ItemId,'AdminPercentage',AdminPercentage, OldAdminPercentage FROM #FinalAudit
		WHERE cast(AdminPercentage as decimal (5, 4)) <> cast(OldAdminPercentage as decimal (5, 4))
		UNION
		SELECT AuditID,ItemId,'PolicyCancelReason',PolicyCancelReason, OldPolicyCancelReason FROM #FinalAudit 
		WHERE PolicyCancelReason <> OldPolicyCancelReason
		UNION
		SELECT AuditID,ItemId,'ClientReference',ClientReference, OldClientReference FROM #FinalAudit
		WHERE JuristicRepresentativeId <> OldJuristicRepresentativeId 
		UNION
		SELECT AuditID,ItemId,'LastLapsedDate',LastLapsedDate, OldLastLapsedDate FROM #FinalAudit
		WHERE LastLapsedDate <> OldLastLapsedDate 
		UNION
		SELECT AuditID,ItemId,'LapsedCount',LapsedCount, OldLapsedCount FROM #FinalAudit
		WHERE LapsedCount <> OldLapsedCount 
		UNION
		SELECT AuditID,ItemId,'LastReinstateDate',LastReinstateDate, OldLastReinstateDate FROM #FinalAudit
		WHERE LastReinstateDate <> OldLastReinstateDate 
		UNION
		SELECT AuditID,ItemId,'PolicyMovementId',PolicyMovementId, OldPolicyMovementId 
		FROM #FinalAudit
		WHERE PolicyMovementId <> OldPolicyMovementId
		UNION
		SELECT AuditID,ItemId,'PolicyPauseDate',PolicyPauseDate, OldPolicyPauseDate FROM #FinalAudit
		WHERE PolicyPauseDate <> OldPolicyPauseDate 
		UNION
		SELECT AuditID,ItemId,'CanLapse',CanLapse, OldCanLapse
		FROM #FinalAudit
		WHERE CanLapse <> OldCanLapse

	IF OBJECT_ID(N'tempdb..#FinalAudit1', N'U') IS NOT NULL
		DROP TABLE #FinalAudit1;
		Select tfa.ItemId as ItemId2,ChangedColumn,NewColumn ,OldColumn,fa.*
		into #FinalAudit1 
		from #FinalAudit fa	
		inner join #TempFinalAudit tfa on fa.ItemID =tfa.ItemId
		and fa.ItemID =tfa.ItemId
		and fa.AuditID =tfa.AuditID
		AND ((fa.PolicyNumber = @PolicyNumber or @PolicyNumber IS NULL))
		



		select distinct
		fa1.PolicyNumber,fa1.[Action],fa1.[User],fa1.[Date],fa1.ItemId2,fa1.ChangedColumn,
		cps.Name AS NewPolicyStaus,cpso.Name AS OldPolicyStaus1,
		Case when ChangedColumn ='PolicyStatus' then cps.Name 
		when ChangedColumn ='PolicyCancelReason' then cpcr.Name 
		else NewColumn end AS NewColumn1,
		Case when ChangedColumn ='PolicyStatus' then cpso.Name 
		when ChangedColumn ='PolicyCancelReason' then isnull(cpcro.Name,'Blank') 
		else OldColumn end AS OldColumn1,
		fa1.ChangedColumn + ' ' + 'Changed from : ' + Case when ChangedColumn ='PolicyStatus' then cpso.Name 
		when ChangedColumn ='PolicyCancelReason' then isnull(cpcro.Name,'Blank') 
		else OldColumn end  + ' to ' +  ' ' + Case when ChangedColumn ='PolicyStatus' then cps.Name 
		when ChangedColumn ='PolicyCancelReason' then cpcr.Name 
		else NewColumn end AS [Description]
		from #FinalAudit1 fa1
		LEFT JOIN common.policystatus cps (NOLOCK) ON fa1.PolicyStatus = cps.Id AND fa1.ChangedColumn ='PolicyStatus' 
		LEFT JOIN common.policystatus cpso (NOLOCK) ON fa1.OldPolicyStatus = cpso.Id AND fa1.ChangedColumn ='PolicyStatus' 
		LEFT JOIN common.PolicyCancelReason cpcr (NOLOCK) ON fa1.PolicyCancelReason = cast(cpcr.Id as char(10)) AND fa1.ChangedColumn ='PolicyCancelReason' 
		LEFT JOIN common.PolicyCancelReason cpcro (NOLOCK) ON fa1.OldPolicyCancelReason = cast(cpcro.Id as char(10)) AND fa1.ChangedColumn ='PolicyCancelReason' 
		WHERE (fa1.PolicyNumber = @PolicyNumber  or @PolicyNumber IS NULL)
		
		union

		select distinct
		fa1.PolicyNumber, 'Created' AS [Action],fa1.[User],fa1.[Date],fa1.ItemId AS ItemId2
		,'New Policy Added' as ChangedColumn,
		fa1.PolicyStatus AS NewPolicyStaus,'' AS OldPolicyStaus1,
		'Policy Added' AS NewColumn1,
		'' AS OldColumn1,
		'New Policy Created' AS [Description]
		from #FinalAudit fa1
		where fa1.Action ='Added'
		and (fa1.PolicyNumber = @PolicyNumber  or @PolicyNumber IS NULL)
		

END
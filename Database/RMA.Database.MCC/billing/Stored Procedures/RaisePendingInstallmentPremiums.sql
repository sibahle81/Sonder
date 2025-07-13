ALTER PROCEDURE [billing].[RaisePendingInstallmentPremiums]
 /* ==========================================================================================
	Name:			RaisePendingInstallementPremiums
	Description:	Raise pending installment premiums for policies based on given client type
	Author:			Sibahle Senda
	Create Date:	2020-03-05
	Change Date:	2021-02-03
	Change Date:	2024-07-17 - added optional parameter to solve the debit day issue 
								where days greater than 29 are causing havoc for Feb in non-leap years
								and 30 and 31 causing issue for some months
	Change Date:	2024-10-08 - added support for municipality policies
	Change Date:	2025-03-19 - Fixed InsuredLifeCount issue
	Culprits:		Conrad Cilliers, Musa Kubheka, Edgar Blount
	Sample Runs:	--EXEC [billing].[RaisePendingInstallmentPremiums] 1, 2, 0, 0, 1 -- (invidividual)
					--EXEC [billing].[RaisePendingInstallmentPremiums] 3, 2, 0, 0, 1 -- (group)
	========================================================================================== */
	@clientTypeId int = 0,
	@paymentFrequencyId int = 0,
	@policyId int = 0,
	@reportOnly bit = 0,
	@commit bit = 1,
	@forceRaisePremium bit = 0,
	@date datetime = NULL
AS
DECLARE @Error nvarchar(max) = '', @SystemUser varchar(200) = 'system@randmutual.co.za'

DECLARE @PoliciesToProcess TABLE (Id int identity(1, 1), PolicyId int, InstallmentPremium decimal(18, 2), InvoiceDate date,
SystemUser varchar(200), MemberName varchar(300))

/* CFP Policies for municipalities */
INSERT @PoliciesToProcess
SELECT p.PolicyId, InstallmentPremium, PolicyInceptionDate, @SystemUser, 
UPPER(CONCAT(per.FirstName, ' ', per.Surname))
FROM [Policy].[Policy] p (nolock)
	INNER JOIN client.Person per (nolock) on per.RolePlayerId = p.PolicyOwnerId
	INNER JOIN client.RolePlayerPersalDetail pd (nolock) on pd.RolePlayerId = per.RolePlayerId
WHERE p.ProductOptionId in (132, 133)
  AND p.PaymentMethodId = 19
  AND pd.IsDeleted = 0
ORDER BY pd.Employer

IF @Commit IS NULL
 SET @Commit = 1

IF @date IS NULL
	SET @date = GETDATE()

create table #Policies(PolicyId int, PolicyStatusId int, InstallmentDate date, InstallmentPremium money,
CommissionPercentage decimal(5,4), AdminPercentage decimal(5,4), PolicyNumber varchar(50), PolicyOwnerId int,
PolicyPayeeId int, PaymentFrequencyId int, TotalPremium money, PremiumPerInsuredLife money, InsuredLifeCount int, InsuredLifePremiumApplicableCount int, isCoidPolicy bit
)

CREATE NONCLUSTERED INDEX IX_Policies ON #Policies (PolicyId)
WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, 
DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]

SET NOCOUNT ON;  
SET XACT_ABORT ON;

--*********************************************************************************
if(@policyId = 0)
begin
	set @policyId = null
end

if(@clientTypeId = 0)
begin
	set @clientTypeId = null
end

if(@paymentFrequencyId = 0)
begin
	set @paymentFrequencyId = null
end
--*********************************************************************************

DECLARE @rolePlayerIdentificationTypeId int
IF @clientTypeId = 1 -- individual
  SET @rolePlayerIdentificationTypeId = 1
ELSE IF @clientTypeId > 0
  SET @rolePlayerIdentificationTypeId = 2 -- group
ELSE
  SET @rolePlayerIdentificationTypeId = null 

DECLARE @today date = getdate()

DECLARE @currentMonth int = (SELECT Month(@today) AS Month)

DECLARE @invoiceDate date,  @maxInceptionDate date

IF (@currentMonth = 12)
  SELECT @invoiceDate = (SELECT DATEFROMPARTS(DATEPART(yyyy, @date), 12, 1))
ELSE
  SELECT @invoiceDate = (SELECT DATEFROMPARTS(DATEPART(yyyy, @date), DATEPART(mm, @date), 1))

SELECT @maxInceptionDate = dateadd(d, 1, @invoiceDate);
DECLARE @endOfCurrentMonth date = (SELECT EOMONTH(@date))

DECLARE @coidProductIds table (productId int)

INSERT INTO @coidProductIds
SELECT Id FROM product.product WHERE ProductClassId IN (SELECT Id FROM common.ProductClass WHERE Id = 1) --Statutory
 
INSERT #Policies(PolicyId, PolicyStatusId, InstallmentDate, InstallmentPremium,
CommissionPercentage, AdminPercentage, PolicyNumber, PolicyOwnerId,
PolicyPayeeId, PaymentFrequencyId, TotalPremium, PremiumPerInsuredLife, InsuredLifeCount, InsuredLifePremiumApplicableCount, isCoidPolicy)
SELECT DISTINCT p.PolicyId, PolicyStatusId, (SELECT DATEFROMPARTS(DATEPART(yyyy, @date), DATEPART(mm, @date), CASE RegularInstallmentDayOfMonth WHEN 0 THEN DAY(EOMONTH(@date)) ELSE RegularInstallmentDayOfMonth END)),
InstallmentPremium, CommissionPercentage, AdminPercentage, PolicyNumber, PolicyOwnerId, PolicyPayeeId, PaymentFrequencyId, 0, 0, 0, 0,
(case when coidProduct.Id IS NULL then 0 else 1 end) [isCoidPolicy]
FROM [policy].[Policy] (NOLOCK) p
INNER JOIN [common].[PolicyStatus](NOLOCK) ps on ps.Id = p.PolicyStatusId
INNER JOIN [policy].[PolicyStatusActionsMatrix](NOLOCK) psam on psam.PolicyStatus = p.PolicyStatusId
INNER JOIN [client].[RolePlayer](NOLOCK) rp on rp.RolePlayerId = p.PolicyOwnerId
INNER JOIN [client].[FinPayee](NOLOCK) fp on fp.RolePlayerId = rp.RolePlayerId
INNER JOIN [product].[ProductOption](NOLOCK) po on po.Id = p.ProductOptionId
LEFT OUTER JOIN [billing].[Invoice](NOLOCK) i on i.PolicyId = p.PolicyId 
OUTER APPLY ((SELECT TOP 1 i2.InvoiceId FROM [billing].[Invoice] (NOLOCK) i2 WHERE i2.PolicyId = i.PolicyId and  ((DATEPART(mm,i2.InvoiceDate) = DATEPART(mm,@date)) and (DATEPART(YYYY,i2.InvoiceDate) = DATEPART(YYYY,@date)) and p.PaymentFrequencyId = 2) and @currentMonth != 12)) normalMonthly
OUTER APPLY ((SELECT TOP 1 i2.InvoiceId FROM [billing].[Invoice] (NOLOCK) i2 WHERE i2.PolicyId = i.PolicyId and  ((DATEPART(mm,i2.InvoiceDate) = 12) and (DATEPART(YYYY,i2.InvoiceDate) = DATEPART(YYYY,@date)) and p.PaymentFrequencyId = 2) and @currentMonth = 12)) mTwelve
OUTER APPLY ((SELECT TOP 1 i2.InvoiceId FROM [billing].[Invoice] (NOLOCK) i2 WHERE i2.PolicyId = i.PolicyId and  ((SELECT DATEDIFF(month, (SELECT DATEADD(month, -1,(SELECT MAX(i3.InvoiceDate) FROM [billing].[Invoice] (NOLOCK) i3 WHERE i3.PolicyId = p.PolicyId))), (SELECT @date))) < 12) and p.PaymentFrequencyId = 1)) yearly
OUTER APPLY ((SELECT TOP 1 i2.InvoiceId FROM [billing].[Invoice] (NOLOCK) i2 WHERE i2.PolicyId = i.PolicyId and  ((SELECT DATEDIFF(month, (SELECT DATEADD(month, -1,(SELECT MAX(i4.InvoiceDate) FROM [billing].[Invoice] (NOLOCK) i4 WHERE i4.PolicyId = p.PolicyId))), (SELECT @date))) < 3) and p.PaymentFrequencyId = 3)) quaterly
OUTER APPLY ((SELECT TOP 1 i2.InvoiceId FROM [billing].[Invoice] (NOLOCK) i2 WHERE i2.PolicyId = i.PolicyId and  ((SELECT DATEDIFF(month, (SELECT DATEADD(month, -1,(SELECT MAX(i5.InvoiceDate) FROM [billing].[Invoice] (NOLOCK) i5 WHERE i5.PolicyId = p.PolicyId))), (SELECT @date))) < 6) and p.PaymentFrequencyId = 4)) biannual
OUTER APPLY (SELECT TOP 1 pr.Id FROM [product].[Product](NOLOCK) pr WHERE pr.Id = po.ProductId and pr.Id in (select productId FROM @coidProductIds)) coidProduct 
WHERE psam.DoRaiseInstallementPremiums = 1
AND p.PolicyId = ISNULL(@policyId,p.PolicyId)
AND p.PaymentFrequencyId = ISNULL(@paymentFrequencyId,p.PaymentFrequencyId)
AND ((EXISTS (SELECT c.RolePlayerId FROM [client].[Company] (NOLOCK) c WHERE c.RolePlayerId = p.PolicyOwnerId) and @RolePlayerIdentificationTypeId = 2) 
      OR (rp.RolePlayerIdentificationTypeId = @rolePlayerIdentificationTypeId))
AND ( mTwelve.InvoiceId IS NULL
AND yearly.InvoiceId IS NULL
AND normalMonthly.InvoiceId IS NULL
AND quaterly.InvoiceId IS NULL
AND biannual.InvoiceId IS NULL
OR (@forceRaisePremium = 1 and @policyId > 0)
)
AND p.PolicyId > 0
AND (p.PolicyInceptionDate <  @maxInceptionDate or @policyId > 0)
AND (p. RegularInstallmentDayOfMonth  is not null or coidProduct.Id in (select productId FROM @coidProductIds))
AND (p. RegularInstallmentDayOfMonth <= DATEPART(dd,@endOfCurrentMonth)  or coidProduct.Id in (select productId FROM @coidProductIds))
AND p.InstallmentPremium > 0
AND p.ParentPolicyId IS NULL
AND (p.PolicyInceptionDate <= @invoiceDate or @policyId > 0)

INSERT #Policies(PolicyId, PolicyStatusId, InstallmentDate, InstallmentPremium,
CommissionPercentage, AdminPercentage, PolicyNumber, PolicyOwnerId,
PolicyPayeeId, PaymentFrequencyId, TotalPremium, PremiumPerInsuredLife, InsuredLifeCount, isCoidPolicy) 
SELECT DISTINCT p.PolicyId, PolicyStatusId, (SELECT DATEFROMPARTS(DATEPART(yyyy, @date), DATEPART(mm, @date), DATEPART(dd, @endOfCurrentMonth))),
InstallmentPremium, CommissionPercentage, AdminPercentage, PolicyNumber, PolicyOwnerId, PolicyPayeeId, PaymentFrequencyId, 0, 0, 0, 0
FROM [policy].[Policy] (NOLOCK) p
INNER JOIN [common].[PolicyStatus] (NOLOCK) ps on ps.Id = p.PolicyStatusId
INNER JOIN [policy].[PolicyStatusActionsMatrix] (NOLOCK) psam on psam.PolicyStatus = p.PolicyStatusId
INNER JOIN [client].[RolePlayer] (NOLOCK) rp on rp.RolePlayerId = p.PolicyOwnerId
INNER JOIN [client].[FinPayee] (NOLOCK) fp on fp.RolePlayerId = rp.RolePlayerId
INNER JOIN [product].[ProductOption](NOLOCK) po on po.Id = p.ProductOptionId
LEFT OUTER JOIN [billing].[Invoice] (NOLOCK) i on i.PolicyId = p.PolicyId 
OUTER APPLY ((SELECT TOP 1 i2.InvoiceId FROM [billing].[Invoice] (NOLOCK) i2 WHERE i2.PolicyId = i.PolicyId and  ((DATEPART(mm,i2.InvoiceDate) = DATEPART(mm,@date)) and (DATEPART(YYYY,i2.InvoiceDate) = DATEPART(YYYY,@date)) and p.PaymentFrequencyId = 2) and @currentMonth != 12)) normalMonthly
OUTER APPLY ((SELECT TOP 1 i2.InvoiceId FROM [billing].[Invoice] (NOLOCK) i2 WHERE i2.PolicyId = i.PolicyId and  ((DATEPART(mm,i2.InvoiceDate) = 12) and (DATEPART(YYYY,i2.InvoiceDate) = DATEPART(YYYY,@date)) and p.PaymentFrequencyId = 2) and @currentMonth = 12)) mTwelve
OUTER APPLY ((SELECT TOP 1 i2.InvoiceId FROM [billing].[Invoice] (NOLOCK) i2 WHERE i2.PolicyId = i.PolicyId and  ((SELECT DATEDIFF(month, (SELECT DATEADD(month, -1,(SELECT MAX(i3.InvoiceDate) FROM [billing].[Invoice] (NOLOCK) i3 WHERE i3.PolicyId = p.PolicyId))), (SELECT @date))) < 12) and p.PaymentFrequencyId = 1)) yearly
OUTER APPLY ((SELECT TOP 1 i2.InvoiceId FROM [billing].[Invoice] (NOLOCK) i2 WHERE i2.PolicyId = i.PolicyId and  ((SELECT DATEDIFF(month, (SELECT DATEADD(month, -1,(SELECT MAX(i4.InvoiceDate) FROM [billing].[Invoice] (NOLOCK) i4 WHERE i4.PolicyId = p.PolicyId))), (SELECT @date))) < 3) and p.PaymentFrequencyId = 3)) quaterly
OUTER APPLY ((SELECT TOP 1 i2.InvoiceId FROM [billing].[Invoice] (NOLOCK) i2 WHERE i2.PolicyId = i.PolicyId and  ((SELECT DATEDIFF(month, (SELECT DATEADD(month, -1,(SELECT MAX(i5.InvoiceDate) FROM [billing].[Invoice] (NOLOCK) i5 WHERE i5.PolicyId = p.PolicyId))), (SELECT @date))) < 6) and p.PaymentFrequencyId = 4)) biannual
WHERE psam.DoRaiseInstallementPremiums = 1
AND p.PolicyId = ISNULL(@policyId,p.PolicyId)
AND p.PaymentFrequencyId = ISNULL(@paymentFrequencyId,p.PaymentFrequencyId)
AND ((EXISTS (SELECT c.RolePlayerId FROM [client].[Company] (NOLOCK) c WHERE c.RolePlayerId = p.PolicyOwnerId) and @RolePlayerIdentificationTypeId = 2) 
      OR (rp.RolePlayerIdentificationTypeId = @rolePlayerIdentificationTypeId))
AND ( mTwelve.InvoiceId IS NULL
AND yearly.InvoiceId IS NULL
AND normalMonthly.InvoiceId IS NULL
AND quaterly.InvoiceId IS NULL
AND biannual.InvoiceId IS NULL
OR (@forceRaisePremium = 1 and @policyId > 0)
)
AND p.PolicyId > 0
AND (p.PolicyInceptionDate <  @maxInceptionDate or @policyId > 0)
AND p. RegularInstallmentDayOfMonth  is not null
AND p. RegularInstallmentDayOfMonth > DATEPART(dd,@endOfCurrentMonth) 
AND p.InstallmentPremium > 0
AND p.ParentPolicyId IS NULL
AND (p.PolicyInceptionDate <= @invoiceDate or @policyId > 0)
UNION
SELECT DISTINCT p.PolicyId, PolicyStatusId,
((SELECT DATEFROMPARTS(DATEPART(yyyy, @date), DATEPART(mm, @date), DATEPART(dd, @endOfCurrentMonth)))),
p.InstallmentPremium, CommissionPercentage, AdminPercentage, PolicyNumber, PolicyOwnerId,
PolicyPayeeId, PaymentFrequencyId, p.InstallmentPremium, 0, 0, 0--, 0, PolicyInceptionDate
FROM [policy].[Policy] (NOLOCK) p
INNER JOIN [common].[PolicyStatus] (NOLOCK) ps ON ps.Id = p.PolicyStatusId
INNER JOIN [client].[RolePlayer] (NOLOCK) rp ON rp.RolePlayerId = p.PolicyOwnerId
INNER JOIN [client].[FinPayee] (NOLOCK) fp ON fp.RolePlayerId = rp.RolePlayerId
INNER JOIN [product].[ProductOption] (NOLOCK) po ON po.Id = p.ProductOptionId
INNER JOIN @PoliciesToProcess t ON t.PolicyId = p.PolicyId
WHERE NOT EXISTS (SELECT 1 FROM #Policies ipo WHERE ipo.PolicyId = p.PolicyId) 

IF (@currentMonth = 12)
BEGIN
  UPDATE p1
	SET InstallmentDate = (SELECT DATEFROMPARTS(DATEPART(yyyy, @date), 
								DATEPART(mm, @date), 
								ISNULL(DecemberInstallmentDayOfMonth, 
								RegularInstallmentDayOfMonth)))
  FROM #Policies p1, [policy].[Policy] p2
  WHERE p1.PolicyId = p2.PolicyId
END

DECLARE @cutOffDate date = (SELECT DATEFROMPARTS(DATEPART(yyyy, @today), DATEPART(mm, @today), 
							(SELECT [value] FROM [common].[Settings] WHERE [key] = 'PolicyApprovalCutOffDay')))

DECLARE @policyPendingFirstPremiumStatus int = 8

 /* update p1 set InstallmentDate = p2.FirstInstallmentDate FROM #Policies p1, [policy].[Policy] p2 
 WHERE p1.PolicyStatusId = @policyPendingFirstPremiumStatus and p2.PolicyId = p1.PolicyId
 and p2.FirstInstallmentDate != '0001-01-01'

 update p1 set InstallmentDate = @cutOffDate FROM #Policies p1, [policy].[Policy] p2 
 WHERE p1.PolicyStatusId = @policyPendingFirstPremiumStatus and p2.PolicyId = p1.PolicyId
 and p2.FirstInstallmentDate = '0001-01-01'*/

 -- If installment day is greater than max day in current month then set installment day to max day minus two days
 UPDATE p1
	SET InstallmentDate = (SELECT
						DATEFROMPARTS(DATEPART(yyyy, @endOfCurrentMonth),
						DATEPART(mm, @endOfCurrentMonth),
						DATEPART(dd, @endOfCurrentMonth))) 
 FROM #Policies p1
 WHERE DATEPART(dd, p1.InstallmentDate) > DATEPART(dd, @endOfCurrentMonth)

 /* update p1
 set p1.InstallmentDate = (select DATEFROMPARTS(DATEPART(yyyy,@endOfCurrentMonth), DATEPART(mm,@endOfCurrentMonth), DATEPART(dd,GETDATE()))) 
 FROM #Policies p1
 WHERE DATEPART(dd,p1.InstallmentDate) <= DATEPART(dd,GETDATE()) */

 -- set number of insured lifes
UPDATE p
	SET p.InsuredLifeCount = (SELECT count(pil.PolicyId)
FROM [policy].[PolicyInsuredLives] pil
WHERE pil.PolicyId = p.PolicyId
and pil.RolePlayerTypeId in (10) -- main member
and (pil.EndDate >  EOMONTH(@today) OR pil.EndDate IS NULL)
and pil.StartDate <= @maxInceptionDate) from #Policies p

UPDATE p 
SET p.InsuredLifePremiumApplicableCount = (SELECT count(pil.PolicyId)
	FROM [policy].[PolicyInsuredLives] pil
	WHERE pil.PolicyId = p.PolicyId
		AND pil.InsuredLifeStatusId in (1) -- active
		AND pil.RolePlayerTypeId in (10) -- main member
		AND (pil.EndDate >  EOMONTH(@today) or pil.EndDate is null) 
		AND pil.StartDate <= @maxInceptionDate)
FROM #Policies p

  /****** GROUP POLICIES ******/
   -- set number of insured lifes
UPDATE p
SET InsuredLifeCount = pil_count.count_value
FROM #Policies p
JOIN (
     SELECT p2.ParentPolicyId, count(pil.PolicyId) as count_value FROM [policy].[PolicyInsuredLives] pil
 join [policy].[Policy] p2 on p2.PolicyId = pil.PolicyId
 join #Policies p on p.PolicyId = p2.ParentPolicyId
  where pil.PolicyId = p2.PolicyId
  and pil.RolePlayerTypeId in (10) -- main member
  and (pil.EndDate >  EOMONTH(@today) or pil.EndDate is null) 
  and pil.StartDate <= @maxInceptionDate
  group by p2.ParentPolicyId
) pil_count ON p.PolicyId = pil_count.ParentPolicyId;

UPDATE p
SET InsuredLifePremiumApplicableCount = pil_count.count_value
FROM #Policies p
JOIN (
     SELECT p2.ParentPolicyId, count(pil.PolicyId) as count_value FROM [policy].[PolicyInsuredLives] pil
 join [policy].[Policy] p2 on p2.PolicyId = pil.PolicyId
 join #Policies p on p.PolicyId = p2.ParentPolicyId
 join [policy].[PolicyStatusActionsMatrix] psam on psam.PolicyStatus = p2.PolicyStatusId
 where pil.PolicyId = p2.PolicyId
  and pil.InsuredLifeStatusId in (1) -- active
  and pil.RolePlayerTypeId in (10) -- main member
  and (pil.EndDate >  EOMONTH(@today) or pil.EndDate is null) 
  and pil.StartDate <= @maxInceptionDate
  and  psam.DoRaiseInstallementPremiums = 1
  group by p2.ParentPolicyId
) pil_count ON p.PolicyId = pil_count.ParentPolicyId
  
  /***** END GROUP POLICIES SECTION *****/

DELETE FROM #Policies WHERE InsuredLifeCount = 0 and isCoidPolicy = 0

 -- calculate premiums per insured lifes
UPDATE p 
	SET p.PremiumPerInsuredLife = p.InstallmentPremium / p.InsuredLifeCount
FROM #Policies p WHERE p.InsuredLifeCount > 0 and isCoidPolicy = 0

 --calculate total premiums
UPDATE p
	SET p.TotalPremium = p.PremiumPerInsuredLife * p.InsuredLifePremiumApplicableCount
FROM #Policies p WHERE p.isCoidPolicy = 0

UPDATE p
	SET p.TotalPremium = p.InstallmentPremium
FROM #Policies p WHERE p.isCoidPolicy = 1

 /* update p set p.InstallmentDate = DATEADD(DD,-2,p.InstallmentDate) FROM #Policies p
 WHERE DATEPART(dd,p.InstallmentDate) > DATEPART(dd,GETDATE()) + 2

 update p set p.InstallmentDate = DATEADD(DD,-1,p.InstallmentDate) FROM #Policies p
 WHERE DATEPART(dd,p.InstallmentDate) > DATEPART(dd,GETDATE()) + 1 */

DELETE FROM #Policies WHERE TotalPremium = 0

if (@ReportOnly = 1)
begin
	select * FROM #Policies ORDER BY PolicyId desc
	goto Success
end
 
if (@Commit = 0)
begin
	select p.PolicyId, p.InstallmentDate, p.TotalPremium, 3, '', @invoiceDate, @SystemUser, @SystemUser, @today, @today
	FROM #Policies p
	where p.TotalPremium is not null
goto Success
end

declare @invoicePendingStatus int = 3

BEGIN TRY
   BEGIN TRANSACTION

	-- Add Invoices
	INSERT INTO [billing].[Invoice] (PolicyId, CollectionDate, TotalInvoiceAmount, InvoiceStatusId, InvoiceNumber, InvoiceDate, CreatedBy, ModifiedBy, CreatedDate, ModifiedDate)
	SELECT p.PolicyId, ISNULL(p.InstallmentDate, (select @date)), p.TotalPremium, @invoicePendingStatus, '', @invoiceDate, @SystemUser, @SystemUser, @today, @today
	FROM #Policies p
	WHERE p.TotalPremium is not null

-- Add Invoice Line Items
	INSERT INTO [billing].[InvoiceLineItems] (InvoiceId, Amount,policyid, CreatedBy, ModifiedBy, CreatedDate, ModifiedDate)
	select i.InvoiceId, p.PremiumPerInsuredLife,p.PolicyId, @SystemUser, @SystemUser, @today, @today
	FROM #Policies p
	INNER JOIN[billing].[Invoice] i on i.PolicyId = p.PolicyId
	INNER JOIN[policy].[PolicyInsuredLives] pil on pil.PolicyId = p.PolicyId
	where i.InvoiceDate = @invoiceDate and p.TotalPremium is not null
	and pil.InsuredLifeStatusId in (1) -- active
	and pil.RolePlayerTypeId in (10) -- main member

	INSERT INTO [billing].[InvoiceLineItems] (InvoiceId, Amount,policyid, CreatedBy, ModifiedBy, CreatedDate, ModifiedDate)
	select i.InvoiceId, p2.InstallmentPremium,p2.PolicyId, @SystemUser, @SystemUser, @today, @today
	FROM #Policies p
	INNER JOIN[policy].[Policy] p2 on p2.ParentPolicyId = p.PolicyId
	INNER JOIN[billing].[Invoice] i on i.PolicyId = p.PolicyId
	INNER JOIN[policy].[PolicyInsuredLives] pil on pil.PolicyId = p2.PolicyId
	INNER JOIN[policy].[PolicyStatusActionsMatrix] psam on psam.PolicyStatus = p2.PolicyStatusId
	where i.InvoiceDate = @invoiceDate
	and psam.DoRaiseInstallementPremiums = 1
	and pil.InsuredLifeStatusId in (1) -- active
	and pil.RolePlayerTypeId in (10) -- main member

		-- Premium listing transactions	
	INSERT INTO [billing].[PremiumListingTransaction] ([RolePlayerId], [PolicyId], [InvoiceDate], [InvoiceAmount], [PaymentAmount], [InvoiceStatusId], 	
	                                                   [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])	
	select distinct p2.[PolicyOwnerId] [RolePlayerId],	
		    p2.[PolicyId],	
			@invoiceDate [InvoiceDate],	
			p2.[InstallmentPremium] [InvoiceAmount],	
			0.0 [PaymentAmount],	
			3 [PaymentStatusId],	
			0 [IsDeleted],	
		    @SystemUser [CreatedBy], 	
		    @date [CreatedDate], 	
		    @SystemUser [ModifiedBy], 	
		    @date [ModifiedDate]	
	FROM #Policies p	
		INNER JOIN[policy].[Policy] p2 on p2.[ParentPolicyId] = p.[PolicyId]	
		INNER JOIN[policy].[PolicyInsuredLives] pil on pil.[PolicyId] = p2.[PolicyId]	
		INNER JOIN[policy].[PolicyStatusActionsMatrix] psam on psam.PolicyStatus = p2.PolicyStatusId	
	where pil.[InsuredLifeStatusId] = 1 -- active	
	  and pil.[RolePlayerTypeId] = 10 -- main member	
	  and psam.[DoRaiseInstallementPremiums] = 1
	  and not exists (select plt2.* FROM [billing].[PremiumListingTransaction] plt2 WHERE plt2.RolePlayerId = p2.[PolicyOwnerId] 
	  and plt2.PolicyId = p2.PolicyId and plt2.InvoiceDate = @invoiceDate)

	-- Post Invoice Transactions
	declare @TranType int = 6 -- invoice tran type
	declare @TranTypeLinkId int
	select @TranTypeLinkId = (select Id FROM [billing].[TransactionTypeLink] WHERE [Name] = 'Debit')
	INSERT INTO [billing].[Transactions] (InvoiceId, RolePlayerId, TransactionTypeLinkId, Amount, TransactionDate, BankReference, TransactionTypeId, CreatedBy, ModifiedBy, CreatedDate, ModifiedDate)
	select i.InvoiceId, p.PolicyOwnerId, @TranTypeLinkId, p.TotalPremium, @invoiceDate, p.PolicyNumber, @TranType,@SystemUser, @SystemUser, @today, @today
	FROM #Policies p
	INNER JOIN[billing].[Invoice] i on i.PolicyId = p.PolicyId
	where i.InvoiceDate = @invoiceDate
	
	DROP TABLE #Policies

	COMMIT TRANSACTION
END TRY
BEGIN CATCH
	ROLLBACK TRANSACTION
	SELECT @Error = 'RaisePendingInstallmentPremiums - Error: ' + ERROR_MESSAGE()
	GOTO Error
END CATCH

Success:
	IF (@ReportOnly = 0 and @Commit = 1)
	BEGIN
		SELECT Result = 'Success'
	END
	RETURN 0

Error:
BEGIN
	INSERT INTO [dbo].[Logs] ([Message], MessageTemplate, [Level], [TimeStamp])
	SELECT @Error, @Error, 'Fatal', @date

	SELECT Result = @Error
	RETURN 1
END

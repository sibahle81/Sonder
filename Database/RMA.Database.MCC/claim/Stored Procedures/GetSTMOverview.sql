CREATE PROCEDURE [claim].[GetSTMOverview]
(
    @startDate AS varchar(10),
	@endDate AS varchar(10),
	@notificationType AS Int,
	@claimType AS Int,
	@insuranceType as Int,
	@benefitDue as Int,
	@filter as Bit
)
AS
begin
	IF (@filter = 0)
	  BEGIN
		  select  E.EventTypeId AS 'EventTypeId'
				, PE.PersonEventId AS 'PersonEventId'
				, PE.ClaimTypeId AS 'ClaimTypeId'
				, PE.InsuredLifeId AS 'InsuredLifeId'
				, PE.PersonEventBucketClassId AS 'PersonEventBucketClassId'
				, PE.InsuranceTypeId AS 'InsuranceTypeId'
				, PE.SuspiciousTransactionStatusId AS 'SuspiciousTransactionStatusId'
				, ST.[NAME] AS 'SuspiciousTransactionName'
				, PE.IsStraightThroughProcess AS 'IsStraightThroughProcess'
				, ET.[NAME] AS 'Name'
				, C.ClaimId AS 'ClaimId' 
				, C.ClaimReferenceNumber AS 'number' 

					from claim.[event] (NOLOCK) AS E
					INNER JOIN CLAIM.PERSONEVENT (NOLOCK) AS PE ON E.EventId = PE.EventId
					INNER JOIN CLAIM.CLAIM (NOLOCK) AS C ON PE.PersonEventId = C.PersonEventId
					INNER JOIN common.EventType (NOLOCK) AS ET ON E.EventTypeId = ET.Id
					INNER JOIN common.suspiciousTransactionStatus (NOLOCK) AS ST ON PE.SuspiciousTransactionStatusId = ST.Id
							WHERE E.EventTypeId IN (1,3) 
								AND PE.CreatedDate > DATEADD(MONTH, -3, GETDATE()) 
								AND PE.CreatedDate IS NOT NULL
								AND PE.ClaimTypeId IS NOT NULL
								AND PE.InsuranceTypeId IS NOT NULL
	  END
	IF (@filter = 1)
	BEGIN
		select    
		E.EventTypeId AS 'EventTypeId'
				, PE.PersonEventId AS 'PersonEventId'
				, PE.ClaimTypeId AS 'ClaimTypeId'
				, PE.InsuredLifeId AS 'InsuredLifeId'
				, PE.PersonEventBucketClassId AS 'PersonEventBucketClassId'
				, PE.InsuranceTypeId AS 'InsuranceTypeId'
				, PE.SuspiciousTransactionStatusId AS 'SuspiciousTransactionStatusId'
				, ST.[NAME] AS 'SuspiciousTransactionName'
				, PE.IsStraightThroughProcess AS 'IsStraightThroughProcess'
				, ET.[NAME] AS 'Name'
				, C.ClaimId AS 'ClaimId' 
				, C.ClaimReferenceNumber AS 'number' 
				, PE.CreatedDate as 'CreatedDate'
				into #dataTable
					from claim.[event] (NOLOCK) AS E
					INNER JOIN CLAIM.PERSONEVENT (NOLOCK) AS PE ON E.EventId = PE.EventId
					INNER JOIN CLAIM.CLAIM (NOLOCK) AS C ON PE.PersonEventId = C.PersonEventId
					INNER JOIN common.EventType (NOLOCK) AS ET ON E.EventTypeId = ET.Id
					INNER JOIN common.suspiciousTransactionStatus (NOLOCK) AS ST ON PE.SuspiciousTransactionStatusId = ST.Id
							WHERE E.EventTypeId IN (1,3) 
								AND Cast(PE.CreatedDate as Date) BETWEEN Cast(@startDate as date) AND Cast(@enddate as date)
								AND PE.CreatedDate IS NOT NULL
								AND PE.ClaimTypeId IS NOT NULL
								AND PE.InsuranceTypeId IS NOT NULL

		if(@notificationType > 0 and @claimType = 0 and @insuranceType = 0 and @benefitDue = 0 )
		begin
		select * from #dataTable
		where
			EventTypeId = @notificationType 
			AND CreatedDate IS NOT NULL
		end				
		
		if(@notificationType > 0 and @claimType > 0 and @insuranceType = 0 and @benefitDue = 0 )
		begin
		select * from #dataTable
		where
			EventTypeId = @notificationType 
			and ClaimTypeId = @claimType 
			AND CreatedDate IS NOT NULL
		end

		if(@notificationType > 0 and @claimType > 0 and @insuranceType > 0 and @benefitDue = 0 )
		BEGIN
		select * from #dataTable
		where
			EventTypeId = @notificationType 
			and ClaimTypeId = @claimType 
			and InsuranceTypeId = @insuranceType 
			AND CreatedDate IS NOT NULL
		END 

		if(@notificationType > 0 and @claimType > 0 and @insuranceType > 0 and @benefitDue > 0 )
		BEGIN
		select * from #dataTable
		where
			EventTypeId = @notificationType 
			and ClaimTypeId = @claimType 
			and InsuranceTypeId = @insuranceType 
			and PersonEventBucketClassId = @benefitDue 
			AND CreatedDate IS NOT NULL
		END 

		if(@notificationType = 0 and @claimType = 0 and @insuranceType = 0 and @benefitDue = 0)
		BEGIN
		select * from #dataTable
		where
			EventTypeId IN (1,3) 
		END

		if(@notificationType = 0 and @claimType = 0 and @insuranceType > 0 and @benefitDue = 0)
		BEGIN
		select * from #dataTable
		where
			InsuranceTypeId = @insuranceType 
		END

		if(@notificationType = 0 and @claimType > 0 and @insuranceType = 0 and @benefitDue = 0)
		BEGIN
		select * from #dataTable
		where
			ClaimTypeId = @claimType
		END

	    if(@notificationType = 0 and @claimType = 0 and @insuranceType = 0 and @benefitDue > 0)
		BEGIN
		select * from #dataTable
		where
			PersonEventBucketClassId = @benefitDue 
		END

		drop table #dataTable
	END
END

--exec[claim].[GetSTMOverview]
--'2022/03/22 12:06:49',
--'2022/03/22 12:06:49',
--0,
--0,
--0,
--0,
--1

		

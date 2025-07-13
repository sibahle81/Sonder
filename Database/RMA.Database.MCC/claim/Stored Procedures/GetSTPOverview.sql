CREATE PROCEDURE [claim].[GetSTPOverview]
(
    @startDate AS Datetime,
	@endDate AS Datetime,
	@benefitDue as Int,
	@filter as Bit
)
AS
begin
	IF(@filter = 0)
	  BEGIN
		select * 
		from 
			(select   E.EventId AS 'EventId'
					, E.EventTypeId AS 'EventTypeId'
					, PE.PersonEventId AS 'PersonEventId'
					, PE.PersonEventBucketClassId AS 'PersonEventBucketClassId'
					, SER.[Name] AS 'Reason'
					, PER.STPExitReasonID AS 'ReasonId'
					, E.EventDate AS 'SubmittedDate'
					, C.ClaimId AS 'ClaimId' 
					, row_number() over(partition by PE.personeventid order by PER.CREATEDDATE desc) as 'RN'
						from claim.[event] AS e
							INNER JOIN CLAIM.PERSONEVENT (NOLOCK) AS PE ON E.EventId = PE.EventId
							INNER JOIN CLAIM.CLAIM (NOLOCK) AS C ON PE.PersonEventId = C.PersonEventId
							INNER JOIN claim.PersonEventSTPExitReasons (NOLOCK) AS PER ON PE.PersonEventId = PER.PersonEventID
							INNER JOIN claim.STPExitReason (NOLOCK) AS SER ON PER.STPExitReasonID = SER.STPExitReasonID
							WHERE E.EventDate > DATEADD(MONTH, -3, GETDATE())
							AND EventTypeId = 1) as s
		where RN = 1
	 END
	 IF (@filter = 1)
	 BEGIN
	  select * into #dataTable
	  from 
		(select
		    E.EventId AS 'EventId'
		        , E.EventTypeId AS 'EventTypeId'
				, PE.PersonEventId AS 'PersonEventId'
				, PE.PersonEventBucketClassId AS 'PersonEventBucketClassId'
				, SER.[Name] AS 'Reason'
				, PER.STPExitReasonID AS 'ReasonId'
				, PER.CreatedDate AS 'SubmittedDate'
				, C.ClaimId AS 'ClaimId' 
				, row_number() over(partition by PE.personeventid order by PER.CREATEDDATE desc) as 'RN'
					from claim.[event] AS e
						INNER JOIN CLAIM.PERSONEVENT (NOLOCK) AS PE ON E.EventId = PE.EventId
						INNER JOIN CLAIM.CLAIM (NOLOCK) AS C ON PE.PersonEventId = C.PersonEventId
						INNER JOIN claim.PersonEventSTPExitReasons (NOLOCK) AS PER ON PE.PersonEventId = PER.PersonEventID
						INNER JOIN claim.STPExitReason (NOLOCK) AS SER ON PER.STPExitReasonID = SER.STPExitReasonID
						WHERE Cast(PER.CreatedDate as Date) BETWEEN Cast(@startDate as date) AND Cast(@enddate as date)
						AND EventTypeId = 1) as s
	 where RN = 1

		if(@benefitDue <> 0 )
		begin
		select * from #dataTable
		where
			PersonEventBucketClassId = @benefitDue 
		end	

	    if(@benefitDue = 0 )
		begin
		select * from #dataTable
		end	

		drop table #dataTable	
	END	
END

exec[claim].[GetSTPOverview]
'2022/03/24',
'2022/03/25',
0,
1

--select * from claim.PersonEvent WHERE Cast(createdDate as Date) BETWEEN Cast('2022/03/25' as date) AND Cast('2022/03/25' as date) order by PersonEventID desc 


--use [AZT-MCC]
--select * from claim.PersonEventSTPExitReasons where Cast(CreatedDate as Date) BETWEEN Cast('2022/03/25' as date) AND Cast('2022/03/25' as date) order by PersonEventID desc

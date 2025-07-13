CREATE PROCEDURE [claim].[GetVopdOverview]
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
		select 
		  E.EventTypeId AS 'EventTypeId'
		, PE.ClaimTypeId AS 'ClaimTypeId'
		, PE.PersonEventBucketClassId AS 'PersonEventBucketClassId'
		, PE.InsuranceTypeId AS 'InsuranceTypeId'
		, PE.IsStraightThroughProcess AS 'IsStraightThroughProcess'
		, VR.VopdResponseId AS 'VopdResponseId'
		, VR.VopdStatusId AS 'VopdStatusId'
		, PE.CreatedDate AS 'SubmittedDate'
		, VR.Reason AS 'Reason'
		, VR.DeceasedStatus AS 'DeceasedStatus'
		, VR.Surname AS 'vopdSurname'
		, VR.RolePlayerId as 'VopdRolePlayerId'
		, 0 as 'isMatch'
		into #dataTable1
		from claim.[event] (NOLOCK) AS E
		INNER JOIN CLAIM.PERSONEVENT (NOLOCK) AS PE ON E.EventId = PE.EventId
		INNER JOIN [client].[VopdResponse] (NOLOCK) AS VR ON PE.InsuredLifeId = VR.RolePlayerId
				WHERE E.EventTypeId IN (1,3) 
				    AND PE.CreatedDate > DATEADD(MONTH, -3, GETDATE()) 
					AND VR.Reason is not null
					AND (PE.IsStraightThroughProcess = 1 or (Reason like '%NOT FOUND%' and PE.IsStraightThroughProcess = 0))

		GROUP BY  
		  E.EventTypeId
		, PE.ClaimTypeId
		, PE.PersonEventBucketClassId
		, PE.InsuranceTypeId 
		, PE.IsStraightThroughProcess
		, VR.VopdResponseId
		, VR.VopdStatusId 
		, PE.CreatedDate			
		, VR.Reason
		, VR.DeceasedStatus
		, VR.Surname
		, VR.RolePlayerId
					
		update #dataTable1 set isMatch = 1 where vopdSurname = (select top 1 surname from client.Person where RolePlayerId = VopdRoleplayerId)
		select * from #dataTable1
		drop table #dataTable1		
	END
	IF (@filter = 1)
	BEGIN
	select 
		   
		  E.EventTypeId AS 'EventTypeId'
		, PE.ClaimTypeId AS 'ClaimTypeId'
		, PE.PersonEventBucketClassId AS 'PersonEventBucketClassId'
		, PE.InsuranceTypeId AS 'InsuranceTypeId'
		, PE.IsStraightThroughProcess AS 'IsStraightThroughProcess'
		, VR.VopdResponseId AS 'VopdResponseId'
		, VR.VopdStatusId AS 'VopdStatusId'
		, PE.CreatedDate AS 'SubmittedDate'
		, VR.Reason AS 'Reason'
		, VR.DeceasedStatus AS 'DeceasedStatus'
		, VR.Surname AS 'vopdSurname'
		, VR.RolePlayerId as 'VopdRolePlayerId'
		, 0 as 'isMatch'
		into #dataTable
		from claim.[event] (NOLOCK) AS E
		INNER JOIN CLAIM.PERSONEVENT (NOLOCK) AS PE ON E.EventId = PE.EventId
		INNER JOIN [client].[VopdResponse] (NOLOCK) AS VR ON PE.InsuredLifeId = VR.RolePlayerId
				WHERE E.EventTypeId IN (1,3) 
					AND Cast(PE.CreatedDate as Date) BETWEEN Cast(@startDate as date) AND Cast(@enddate as date)
					AND VR.Reason is not null
					AND (PE.IsStraightThroughProcess = 1 or (Reason like '%NOT FOUND%' and PE.IsStraightThroughProcess = 0))

		GROUP BY  
		   E.EventTypeId
		, PE.ClaimTypeId
		, PE.PersonEventBucketClassId
		, PE.InsuranceTypeId 
		, PE.IsStraightThroughProcess
		, VR.VopdResponseId
		, VR.VopdStatusId 
		, PE.CreatedDate			
		, VR.Reason
		, VR.DeceasedStatus
		, VR.Surname
		, VR.RolePlayerId

		update #dataTable set isMatch = 1 where vopdSurname = (select top 1 surname from client.Person where RolePlayerId = VopdRoleplayerId)

		if(@notificationType <> 0 and @claimType = 0 and @insuranceType = 0 and @benefitDue = 0 )
		begin
		select * from #dataTable
		where
			EventTypeId = @notificationType 
			AND SubmittedDate IS NOT NULL
		end				
		
		if(@notificationType <> 0 and @claimType <> 0 and @insuranceType = 0 and @benefitDue = 0 )
		begin
		select * from #dataTable
		where
			EventTypeId = @notificationType 
			and ClaimTypeId = @claimType 
			AND SubmittedDate IS NOT NULL
		end

		if(@notificationType <> 0 and @claimType <> 0 and @insuranceType <> 0 and @benefitDue = 0 )
		BEGIN
		select * from #dataTable
		where
			EventTypeId = @notificationType 
			and ClaimTypeId = @claimType 
			and InsuranceTypeId = @insuranceType 
			AND SubmittedDate IS NOT NULL
		END 

		if(@notificationType <> 0 and @claimType <> 0 and @insuranceType <> 0 and @benefitDue <> 0 )
		BEGIN
		select * from #dataTable
		where
			EventTypeId = @notificationType 
			and ClaimTypeId = @claimType 
			and InsuranceTypeId = @insuranceType 
			and PersonEventBucketClassId = @benefitDue 
			AND SubmittedDate IS NOT NULL
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


--exec[claim].[GetVopdOverview]
--'2022/03/22',
--'2022/03/23',
--0,
--0,
--0,
--0,
--1

--select * from [client].[VopdResponse] WHERE Cast(SubmittedDate as Date) BETWEEN Cast('2022/03/22' as date) AND Cast('2022/03/23' as date) order by 1 desc
--select * from claim.PersonEvent WHERE Cast(createdDate as Date) BETWEEN Cast('2022/03/22' as date) AND Cast('2022/03/23' as date) order by 1 desc 

--select top(15)* from claim.PersonEvent where IsStraightThroughProcess = 1 order by 1 desc  


------select * from [common].[ClaimType]
--select * from [client].[VopdResponse] where RolePlayerId in (590775,590839,6761) order by 1 desc
--select * from claim.PersonEvent order by 1 desc





	


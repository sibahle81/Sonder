Create   Procedure [debt].[GetDebtorDashboardDataForChart]
(
	@Days int
)
As 
BEGIN 
select TotalRecords, NoOfRecordIndividual, CollectionStatusCodeId, CollectionStatusName, CAST((CAST(NoOfRecordIndividual AS numeric(9,2))/CAST(TotalRecords AS numeric(9,2)))*100 AS DECIMAL(9,2)) [PercentageCountPerStatus]
From (
	select (select count(*) from debt.TransactionCollectionStatus where convert(varchar,TransactionCollectionStatus.ModifiedDate,112) >  convert(varchar,DATEADD (DAY,-@Days,GETDATE()),112)) TotalRecords, 
		count(*) NoOfRecordIndividual, TransactionCollectionStatus.CollectionStatusCodeId, TransactionCollectionStatus.CollectionStatusName 
		from [debt].TransactionCollectionStatus 
		where convert(varchar,TransactionCollectionStatus.ModifiedDate,112) >  convert(varchar,DATEADD (DAY,-@Days,GETDATE()),112)
		group by TransactionCollectionStatus.CollectionStatusCodeId, TransactionCollectionStatus.CollectionStatusName  
	) as tblT
END

-- exec [debt].[GetDebtorDashboardDataForChart] 30  -- @Days = 30  Parameter  this sp returns data for dashborad chart last 30 day records based on ModifiedDate date on [debt].TransactionCollectionStatus Table
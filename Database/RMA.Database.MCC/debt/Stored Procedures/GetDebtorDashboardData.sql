

CREATE   PROCEDURE [debt].GetDebtorDashboardData 
(
 @userId int, 
 @Days int
)
AS 
Begin
	Declare @RolesName as varchar(500)	
	set @RolesName =( select [security].[Role].Name from [security].[User] inner join [security].[Role] on [security].[Role].Id= [security].[User].RoleId where [security].[User].Id = @userId )
END 

If @RolesName = 'Debtor Collection Team Leader' 
	Begin
		SELECT sum(tmpAll.AllData) AllData, sum(tmpAll.OpenData) OpenData, sum(tmpAll.PendingData) PendingData
			,sum(tmpAll.OngoingData) OngoingData, sum(tmpAll.ClosedData) ClosedData  
		from  
			(select COUNT(*) AllData, 0 OpenData, 0 PendingData, 0 OngoingData, 0 ClosedData  from [DEBT].ManagmentTransactions 
				group by 
					DebtCollectionTransactionStatusId
			union all
		 	select 0 AllData, COUNT(*) OpenData, 0 PendingData, 0 OngoingData, 0 ClosedData from [DEBT].ManagmentTransactions
				where [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId = 1 and [DEBT].ManagmentTransactions.IsActive = 1 
				and convert(varchar,ManagmentTransactions.ModifiedDate,112) >  convert(varchar,DATEADD (DAY,-@Days,GETDATE()),112)
				and [DEBT].ManagmentTransactions.IsDeleted = 0  
				group by 
				DebtCollectionTransactionStatusId
			union all
		 	select 0 AllData, 0 OpenData, COUNT(*) PendingData, 0 OngoingData, 0 ClosedData from [DEBT].ManagmentTransactions
				where [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId = 2 and [DEBT].ManagmentTransactions.IsActive = 1  
				and convert(varchar,ManagmentTransactions.ModifiedDate,112) >  convert(varchar,DATEADD (DAY,-@Days,GETDATE()),112)
				and [DEBT].ManagmentTransactions.IsDeleted = 0 
				group by 
				DebtCollectionTransactionStatusId
			union all
		 	select 0 AllData, 0 OpenData, 0 PendingData, COUNT(*) OngoingData, 0 ClosedData  from [DEBT].ManagmentTransactions
				where [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId = 3 and [DEBT].ManagmentTransactions.IsActive = 1 
				and convert(varchar,ManagmentTransactions.ModifiedDate,112) >  convert(varchar,DATEADD (DAY,-@Days,GETDATE()),112)
				and [DEBT].ManagmentTransactions.IsDeleted = 0 
				group by 
				DebtCollectionTransactionStatusId
			union all
		 	select 0 AllData, 0 OpenData, 0 PendingData, 0 OngoingData, COUNT(*) ClosedData   from [DEBT].ManagmentTransactions
				where [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId = 4 and [DEBT].ManagmentTransactions.IsActive = 1 
				and convert(varchar,ManagmentTransactions.ModifiedDate,112) >  convert(varchar,DATEADD (DAY,-@Days,GETDATE()),112)
				and [DEBT].ManagmentTransactions.IsDeleted = 0 
				group by 
				DebtCollectionTransactionStatusId
				) as tmpAll 
 END 
ELSE IF  @RolesName = 'Debtor Collection Agent' 
BEGIN
	SELECT sum(tmpAll.AllData) AllData, sum(tmpAll.OpenData) OpenData, sum(tmpAll.PendingData) PendingData
			,sum(tmpAll.OngoingData) OngoingData, sum(tmpAll.ClosedData) ClosedData  
		from  
			(select COUNT(*) AllData, 0 OpenData, 0 PendingData, 0 OngoingData, 0 ClosedData  from [DEBT].ManagmentTransactions 
				where [DEBT].ManagmentTransactions.AssignedId = @userId and [DEBT].ManagmentTransactions.IsActive = 1
				and convert(varchar,ManagmentTransactions.ModifiedDate,112) >  convert(varchar,DATEADD (DAY,-@Days,GETDATE()),112)
				and [DEBT].ManagmentTransactions.IsDeleted = 0 
				group by 
					DebtCollectionTransactionStatusId
			union all
		 	select 0 AllData, COUNT(*) OpenData, 0 PendingData, 0 OngoingData, 0 ClosedData from [DEBT].ManagmentTransactions
				where [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId=1  
				and [DEBT].ManagmentTransactions.AssignedId = @userId and [DEBT].ManagmentTransactions.IsActive = 1
				and convert(varchar,ManagmentTransactions.ModifiedDate,112) >  convert(varchar,DATEADD (DAY,-@Days,GETDATE()),112)
				and [DEBT].ManagmentTransactions.IsDeleted = 0 
				group by 
				DebtCollectionTransactionStatusId
			union all
		 	select 0 AllData, 0 OpenData, COUNT(*) PendingData, 0 OngoingData, 0 ClosedData from [DEBT].ManagmentTransactions
				where [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId=2  
				and [DEBT].ManagmentTransactions.AssignedId = @userId and [DEBT].ManagmentTransactions.IsActive = 1
				and convert(varchar,ManagmentTransactions.ModifiedDate,112) >  convert(varchar,DATEADD (DAY,-@Days,GETDATE()),112)
				and [DEBT].ManagmentTransactions.IsDeleted = 0 
				group by 
				DebtCollectionTransactionStatusId
			union all
		 	select 0 AllData, 0 OpenData, 0 PendingData, COUNT(*) OngoingData, 0 ClosedData  from [DEBT].ManagmentTransactions
				where [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId=3  
				and [DEBT].ManagmentTransactions.AssignedId = @userId and [DEBT].ManagmentTransactions.IsActive = 1
				and convert(varchar,ManagmentTransactions.ModifiedDate,112) >  convert(varchar,DATEADD (DAY,-@Days,GETDATE()),112)
				and [DEBT].ManagmentTransactions.IsDeleted = 0 
				group by 
				DebtCollectionTransactionStatusId
			union all
		 	select 0 AllData, 0 OpenData, 0 PendingData, 0 OngoingData, COUNT(*) ClosedData   from [DEBT].ManagmentTransactions
				where [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId=4  
				and [DEBT].ManagmentTransactions.AssignedId = @userId and [DEBT].ManagmentTransactions.IsActive = 1 
				and convert(varchar,ManagmentTransactions.ModifiedDate,112) >  convert(varchar,DATEADD (DAY,-@Days,GETDATE()),112)
				and [DEBT].ManagmentTransactions.IsDeleted = 0 
				group by 
				DebtCollectionTransactionStatusId
				) as tmpAll 
END
-- exec [debt].GetDebtorDashboardData  1642, 30  -- Parameter   = @UserId = 1642 (Debtor Collection Team Leader)  @UserId =1637 (Debtor Collection Agent), 
	-- @Days = 30  Parameter  this sp returns data for dashborad last 30 day records based on ModifiedDate date on [debt].TransactionCollectionStatus Table
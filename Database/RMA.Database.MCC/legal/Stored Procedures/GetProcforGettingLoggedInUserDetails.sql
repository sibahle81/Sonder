CREATE Procedure [legal].[GetProcforGettingLoggedInUserDetails]
(
@userEmail AS VARCHAR(200)
)
As
Begin 	
 
select [security].[User].Id,[security].[User].UserName, [security].[User].DisplayName, [security].[User].Email  from [security].[User] 
 where [security].[User].Email = @userEmail and [security].[User].IsDeleted = 0 
END
--exec [legal].[GetProcforGettingLoggedInUserDetails] 'MNgongoma@randmutual.co.za'    -- @userEmail  Email Pass

CREATE PROCEDURE [client].[MemberRenewalLetter] 
(
 @RolePlayerId INT
)
AS 
BEGIN 

--Declare @RolePlayerId INT
--Set @RolePlayerId = 136653

	  Select  CRP.RolePlayerId,CRP.DisplayName,CRP.EmailAddress,CRP.PreferredCommunicationTypeId,
	  CC.Name as CompanyName,CC.CompanyIdTypeId,CC.IndustryId,CC.IndustryClassId,
	  CRPA.AddressTypeId,CRPA.AddressLine1,CRPA.AddressLine2,CRPA.PostalCode,CRPA.City,CRPA.Province,CRPA.CountryId,
	  CFP.FinPayeNumber,CD.Premium,CONVERT(varchar, YEAR(GETDATE())) as CurrentYear,CONVERT(varchar, YEAR(DATEADD(YEAR, -1, GETDATE()))) as PreviousYear,
	  CONVERT(varchar, YEAR(DATEADD(YEAR, 1, GETDATE()))) as NextYear
	  from [client].[RolePlayer] CRP 
	  Inner Join [client].[Company] CC On CRP.RolePlayerId = CC.RolePlayerId
	  Left Join [client].[RolePlayerAddress] CRPA On CRPA.RolePlayerId = CRP.RolePlayerId
	  Inner Join [client].[FinPayee] CFP On CFP.RolePlayerId = CRP.RolePlayerId
	  Left Join [client].[Declaration] CD On CD.RolePlayerID = CRP.RolePlayerId
	  Where CRP.RolePlayerId = @RolePlayerId
END
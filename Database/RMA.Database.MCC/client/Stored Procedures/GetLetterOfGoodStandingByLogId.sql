--------------------
--created by: Bongani Makelane
--created date: 15-03-2023

-------------------

CREATE PROCEDURE [client].[GetLetterOfGoodStandingByLogId]  --2629
(
 @LetterOfGoodStandingId INT
)
AS 
BEGIN 
	  Select CLG.LetterOfGoodStandingId, CRP.RolePlayerId,CRP.DisplayName,CRP.EmailAddress,CRP.PreferredCommunicationTypeId,
	  CC.Name as CompanyName,CC.CompanyIdTypeId,CC.IndustryId,CC.IndustryClassId,
	  CRPA.AddressTypeId,CRPA.AddressLine1,CRPA.AddressLine2,CRPA.PostalCode,CRPA.City,CRPA.Province,CRPA.CountryId,
	  CFP.FinPayeNumber,CLG.IssueDate,CLG.CertificateNo, CLG.ExpiryDate
	  from [client].[RolePlayer] CRP 
	  Inner Join [client].[Company] CC On CRP.RolePlayerId = CC.RolePlayerId
	  Left Join [client].[RolePlayerAddress] CRPA On CRPA.RolePlayerId = CRP.RolePlayerId
	  Inner Join [client].[FinPayee] CFP On CFP.RolePlayerId = CRP.RolePlayerId
	  Left Join [client].[LetterOfGoodStanding] CLG On CLG.RolePlayerId = CRP.RolePlayerId
	  Where  CLG.LetterOfGoodStandingId= @LetterOfGoodStandingId
	  order by CLG.LetterOfGoodStandingId desc
END
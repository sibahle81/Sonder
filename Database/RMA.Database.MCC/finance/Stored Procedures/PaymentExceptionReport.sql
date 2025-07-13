CREATE PROCEDURE [finance].[PaymentExceptionReport]

AS

 BEGIN
 SELECT AccountNo,Count(AccountNo) As Occurences Into #DuplicateAccountNo FROM payment.payment p GROUP BY AccountNo Having COUNT(AccountNo) > 1


 SELECT 
pl.[PolicyNumber]
,cl.[ClaimReferenceNumber]
,p.payee as NameAndSurname
,ps.[Name] as [Status]
,p.[Amount]
,p.[Product]
,STRING_AGG(pn.[Text], CHAR(13)) as Comments
 FROM payment.payment p
 INNER JOIN common.PaymentType pt ON p.PaymentTypeId=pt.Id 
 Inner join [policy].[Policy] pl on p.PolicyId = pl.PolicyId
  Inner join [claim].[Claim] cl on cl.[ClaimId] = p.[ClaimId]
  inner join  [common].[PaymentStatus]  ps on ps.Id = p.PaymentStatusId 
  left join [payment].[Note] pn on p.PaymentId = pn.ItemId
 WHERE PaymentConfirmationDate>= CAST(Dateadd(Month, -12, GETDATE()) AS DATE) 
 and PaymentConfirmationDate<=CAST(GetDate() as DATE)  AND AccountNo IN (SELECT AccountNo FROM  #DuplicateAccountno)
 GROUP BY pl.[PolicyNumber]
,cl.[ClaimReferenceNumber]
,p.payee  
,ps.[Name] 
,p.[Amount]
,p.[Product]
, AccountNo
 ORDER BY AccountNo ASC

 Drop Table #DuplicateAccountno

END
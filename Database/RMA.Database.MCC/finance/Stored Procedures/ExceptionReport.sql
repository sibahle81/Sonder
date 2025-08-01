CREATE PROCEDURE [finance].[ExceptionReport]

AS

 BEGIN
 SELECT AccountNo,Count(AccountNo) As Occurences Into #DuplicateAccountNo FROM payment.payment p GROUP BY AccountNo Having COUNT(AccountNo) > 1


 SELECT p.BatchReference As  [Payment File Number],Payee As [Account Holder],ClaimReference As[Recipient Reference],AccountNo As	[Recipient Account Number],
		p.BankBranch As  [Branch Code],	 [Amount],PaymentConfirmationDate As  [Payment Date],pt.Name As [Type Of Payment]
 FROM payment.payment p
 INNER JOIN common.PaymentType pt ON p.PaymentTypeId=pt.Id 
 WHERE PaymentConfirmationDate>= CAST(Dateadd(Month, -12, GETDATE()) AS DATE) and PaymentConfirmationDate<=CAST(GetDate() as DATE)  AND AccountNo IN (SELECT AccountNo FROM  #DuplicateAccountno)
 ORDER BY AccountNo ASC

 Drop Table #DuplicateAccountno

END



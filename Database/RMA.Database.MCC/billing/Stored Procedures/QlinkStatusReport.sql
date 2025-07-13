
CREATE PROCEDURE [billing].[QlinkStatusReport]
	@brokerId int
AS
BEGIN
		DECLARE @BASICNONCOMMPREM decimal(14,2)
DECLARE @PLUSNONCOMMPREM decimal(14,2)

SELECT @BASICNONCOMMPREM = 
 SUM(BRT.Baserate) from product.product PR 
inner join product.ProductOption PO on PR.id=PO.productid
inner join product.ProductOptionBenefit POB on POB.productoptionID=PO.id
inner join product.benefit BEN on BEN.id=POB.benefitID
inner join product.benefitrate BRT on BEN.id= BRT.benefitid
inner join common.BenefitType BTP on BTP.id=BEN.BenefitTypeId
where PO.id in (132) and BTP.id=2

SELECT @PLUSNONCOMMPREM = 
 SUM(BRT.Baserate) from product.product PR 
inner join product.ProductOption PO on PR.id=PO.productid
inner join product.ProductOptionBenefit POB on POB.productoptionID=PO.id
inner join product.benefit BEN on BEN.id=POB.benefitID
inner join product.benefitrate BRT on BEN.id= BRT.benefitid
inner join common.BenefitType BTP on BTP.id=BEN.BenefitTypeId
where PO.id in (133) and BTP.id=2

select 
    BR.Name as BrokerName, 
    BREP.Code as BrokerRepID, 
    POL.PolicyNumber, 
    PO.Name as ProductID,
    PS.Name as PolicyStatus, 
    pol.CreatedDate as PolicyCaptureDate, 
    QTR.modifieddate as PolicyQADDDate, 
    POL.PolicyInceptionDate, 
    POL.InstallmentPremium as BillingPremiun,
    sum(CASE 
    WHEN RL.Name in ('Main Member (self)') and PO.Name in ('Consolidated Funeral Plus') then PIL.Premium - @PLUSNONCOMMPREM
    WHEN RL.Name in ('Main Member (self)') and PO.Name in ('Consolidated Funeral Basic') then PIL.Premium - @BASICNONCOMMPREM
    ELSE PIL.Premium END   ) as CommissionablePremium,
    Case When PLE.AffordabilityCheckPassed=1 then 'Affordable'
    else 'Not Affordable' END as AffordabilityStatus,
    CASE WHEN doc.Filename is not null THEN 1
    ELSE 0 END as BPUpload,
    CASE WHEN doc.Filename is not null THEN doc.createddate
    ELSE NULL END as BPUploadDate,
    LEFT(QTR.RESULT,4) as QLinkTransactionType,
		QTR.Reason as QLinkTransactionStatus,
    CASE WHEN QTR.RESULT = 'QADDOk' Then QTR.Startdate ELSE NULL END as FirstCollectionMonth,
		QTR.IDNumber,
	QTR.EmployeeNumber,
	QTR.CustomerName,
	QTR.DeductionTerminationDate,
	CASE WHEN QTR.RESULT = 'QDELOk' Then POL.FirstInstallmentDate else NULL End as QDelCollectionMonth,
	CASE WHEN QTR.RESULT = 'QDELOk' Then POL.CancellationDate  else NULL End as CancellationDate 
 from policy.policy POL 
left join [broker].[Brokerage] BR on POL.BrokerageId=BR.[Id]
left Join [broker].[Representative] BRep on BRep.Id = POL.RepresentativeId

left JOIN (
select dk.keyvalue,d.createddate,d.filename from documents.Documentkeys dk
inner join documents.document d on d.id=dk.documentid and d.docTypeID = 2584 and d.id is not null) doc
on doc.keyvalue = cast(POL.policyID as VARCHAR(10))
--left join documents.Documentkeys dk on dk.keyvalue = cast(POL.policyID as VARCHAR(10))
--LEFT join documents.document d on d.id=dk.documentid and d.docTypeID = 2584 
inner join [product].[ProductOption] PO on PO.[Id]=POL.ProductOptionId  
inner join [common].[PolicyStatus] PS on POL.PolicyStatusId=PS.id
inner join policy.PolicylifeExtension PLE on POL.policyID = PLE.PolicyID
inner join policy.PolicyInsuredLives PIL on POL.policyID = PIL.policyID and PIL.isdeleted=0 and PIL.InsuredLifeStatusId=1
inner join client.RolePlayerType RL on PIL.[RolePlayerTypeId]= RL.RolePlayerTypeId
Left join 
(
Select ItemID as PolicyID, 
REPLACE(JSON_VALUE(QT.Response,'$.ReferenceNumber'),'X','-') as PolicyNumber, 
QTT.Name as transactionType, 
modifieddate,
CASE WHEN StatusCode  = 200 THEN QTT.Name + 'Ok'
WHEN JSON_VALUE(QT.REsponse,'$.Message') like '%duplicate%' THEN QTT.Name + 'Ok' 
WHEN JSON_VALUE(QT.REsponse,'$.Message') like '%already exists%' THEN QTT.Name + 'Ok'  
WHEN StatusCode = 400 THEN LEFT(QTT.Name + REPLACE(JSON_VALUE(QT.REsponse,'$.Message'),'Qlink Error:',''),50)
END as RESULT, 
CASE WHEN (JSON_VALUE(QT.REsponse,'$.Message')) = 'Success' THEN 'OK' ELSE  TRIM(REPLACE(JSON_VALUE(QT.REsponse,'$.Message'),'Qlink Error:','')) END as  Reason,
JSON_VALUE(QT.REsponse,'$.Amount') as TransAmount,
JSON_VALUE(QT.REsponse,'$.StartDate') as StartDate,
JSON_VALUE(QT.Request,'$.EmployeeNumber') as EmployeeNumber,
JSON_VALUE(QT.REsponse,'$.IDNumber') as IDNumber,
JSON_VALUE(QT.Request,'$.Initials') + ' ' + JSON_VALUE(QT.REsponse,'$.Surname') as CustomerName,
CASE WHEN QTT.Id = 3 then JSON_VALUE(QT.Request,'$.EndDate')  else ' ' end as DeductionTerminationDate

--,Response StartDate
from 

(select *, 
ROW_NUMBER ( )   
    OVER (  PARTITION BY ItemID order by Modifieddate desc ) as LATEST  
from client.QlinkTRansaction
where StatusCode<>401 --and JSON_VALUE(REsponse,'$.RequestGUID') = '00000000-0000-0000-0000-000000000000'
and QlinkTransactionId not in (1448,1579,998,1452,2262,2280,2294,2310)
) QT

inner join [common].[QLinkTransactionType] QTT on QT.[QlinkTransactionTypeId] = QTT.id
where Itemtype='Policy' and QT.LATEST=1 
--order by policyid 
) QTR on POL.PolicyId = QTR.PolicyID

where POL.isdeleted =0 and POL.ProductOptionId in (132,133) 
group by 
   BR.Name , 
    BREP.Code, 
    POL.PolicyNumber, 
    PO.Name,
    PS.Name, 
    Pol.CreatedDate, 
     QTR.modifieddate, 
    POL.PolicyInceptionDate, 
	POL.InstallmentPremium,
    Case When PLE.AffordabilityCheckPassed=1 then 'Affordable'
    else 'Not Affordable' END,
    CASE WHEN doc.Filename is not null THEN 1
    ELSE 0 END,
    CASE WHEN doc.Filename is not null THEN doc.createddate
    ELSE NULL END,
    QTR.RESULT, 
	Reason,
    CASE WHEN QTR.RESULT = 'QADDOk' Then QTR.STARTDATE ELSE NULL END,
	QTR.IDNumber,
	QTR.EmployeeNumber,
	QTR.CustomerName,
	QTR.DeductionTerminationDate,
	POL.FirstInstallmentDate ,
	POL.CancellationDate

order by  PolicyNumber
END
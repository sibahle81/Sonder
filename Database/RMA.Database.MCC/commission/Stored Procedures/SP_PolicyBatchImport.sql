/*
DROP PROCEDURE IF EXISTS commission.SP_PolicyBatchImport
*/

CREATE PROCEDURE commission.SP_PolicyBatchImport
 @ConfigID int,
 @TESTimport varchar(35) null
-- 'load every 10th pol only'
-- 'every 5thPrem Incr'
-- 'every third prem decr'
-- 'Cancel every 37th pol'
-- 'Do annual incr'


AS BEGIN

--DECLARE @ConfigID INT =1

DECLARE @PRODUCTIDS TABLE
(productID int)

INSERT INTO @PRODUCTIDS (productid)
select distinct productIds from commission.commissionconfig where ConfigID=@ConfigID

DECLARE @BROKERIDS TABLE
(BROKERID int)

INSERT INTO @BROKERIDS (brokerid)
select distinct BrokerID from commission.commissionconfig where ConfigID=@ConfigID


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

DECLARE @NEXTBATCH INT 
 SELECT @NEXTBATCH = MAX (importbatch) +1 from commission.PolicyImport 
 SELECT @NEXTBATCH= ISNULL(@NEXTBATCH,1);

INSERT INTO commission.PolicyImport 
(   ImportBatch ,
    BrokerName    ,
    BrokerRepID  , 
    PolicyNumber  ,
    ProductID   ,
    PolicyStatus  ,
    PolicyCaptureDate,
    PolicyQADDDate,
    PolicyInceptionDate,  
    LifeID  , 
    MemberType , 
    LifeDOB,
    LifeStatus,
    BillingPremium,
    CommissionablePremium    ,
    AffordabilityStatus,
    CollectionStatus,  
    FirstCollectionMonth,
    importeddate ,
    CurrentRecord ,
    RecordVersion , 
    processed,
    AnnIncrType,
    parent,
    CoverAmt,
    PrevCoverAmt,
    statusdate 
) 
select 
@NEXTBATCH as ImportBatch, 
BR.Name as   BrokerName ,
BRep.Code as BrokerRepID,
POL.PolicyNumber,
PO.Name as ProductID,
PS.Name as Policystatus,
pol.CreatedDate as PolicyCaptureDate,
QTR.modifieddate as PolicyQADDDate,
PolicyInceptionDate,   
PIL.RolePlayerId as LifeID,
RL.Name as MemberType,
PEr.DateOfBirth as LifeDOB, 
ILS.Name as LifeStatus,
PIL.Premium + 0 
as BillingPremium,
CASE 
WHEN RL.Name in ('Main Member (self)') and PO.Name in ('Consolidated Funeral Plus') then PIL.Premium - @PLUSNONCOMMPREM
WHEN RL.Name in ('Main Member (self)') and PO.Name in ('Consolidated Funeral Basic') then PIL.Premium - @BASICNONCOMMPREM
ELSE PIL.Premium END as CommissionablePremium ,
Case When PLE.AffordabilityCheckPassed=1 then 'Affordable'
else 'Not Affordable' END as AffordabilityStatus,
QTR.RESULT as CollectionStatus,
CASE WHEN QTR.StartDate = 'null'  THEN NULL
ELSE CONVERT (date, LEFT(QTR.StartDate,4) + '-' + SUBSTRING (QTR.StartDate,5,2) + '-' + SUBSTRING (QTR.StartDate,7,2)) END as StartDate,
GETDATE() as ImportedDate,
1 as CurrentRecord,
0 as RecordVersion,
0 as processed,
AIT.Name as AnnIncrType,
Case WHEN BEN.Name = 'Consolidated Funeral - Parents' Then 'Y' else
 'N' END  as Parent,
PIL.CoverAmount as CoverAmt,
PIR.PrevCoverAmt,
CASE 
WHEN PS.Name in ('Cancelled') THEN POL.CancellationDate 
WHEN PS.Name in ('Active') THEN POL.PolicyInceptionDate 
ELSE PIL.startdate END as statusdate 
from policy.[Policy] POL
inner join [broker].[Brokerage] BR on POL.BrokerageId=BR.[Id] 
inner Join [broker].[Representative] BRep on BRep.Id = POL.RepresentativeId
inner join policy.PolicyInsuredLives PIL on POL.policyID = PIL.policyID and PIL.isdeleted=0 and PIL.InsuredLifeStatusId=1
inner join policy.PolicylifeExtension PLE on POL.policyID = PLE.PolicyID
inner join client.RolePlayerType RL on PIL.[RolePlayerTypeId]= RL.RolePlayerTypeId
inner join client.Person Per on PIL.RolePlayerId = Per.RolePlayerId 
inner join [common].[PolicyStatus] PS on POL.PolicyStatusId=PS.id
inner join [product].[ProductOption] PO on PO.[Id]=POL.ProductOptionId 
inner join common.InsuredLifeStatus ILS on ILS.id=PIL.InsuredLifeStatusId
inner join  [common].[AnnualIncreaseType] AIT on AIT.id=PLE.AnnualIncreaseTypeId
inner join product.benefit BEN on BEN.id=PIL.StatedbenefitID
LEFT JOIN (Select RolePlayerID, Sum(SumAssured) as PrevCoverAmt from  [client].[PreviousInsurerRolePlayer] group by RolePlayerID) PIR on PIL.RolePlayerId = PIR.RolePlayerId
left join 
(
Select ItemID as PolicyID, 
REPLACE(JSON_VALUE(QT.Response,'$.ReferenceNumber'),'X','-') as PolicyNumber, 
QTT.Name as transactionType, 
modifieddate,
CASE WHEN StatusCode  = 200 THEN QTT.Name + 'Ok'
WHEN JSON_VALUE(QT.REsponse,'$.Message') like '%duplicate%' THEN QTT.Name + 'Ok' 
WHEN JSON_VALUE(QT.REsponse,'$.Message') like '%already exists%' THEN QTT.Name + 'Ok'  
WHEN StatusCode = 400 THEN LEFT(QTT.Name + REPLACE(JSON_VALUE(QT.REsponse,'$.Message'),'Qlink Error:',''),30)
END as RESULT,
JSON_VALUE(QT.REsponse,'$.Amount') as TransAmount,
JSON_VALUE(QT.REsponse,'$.StartDate') as StartDate,
JSON_VALUE(QT.REsponse,'$.IDNumber') as IDNumber
--,Response
from 

(select *, 
ROW_NUMBER ( )   
    OVER (  PARTITION BY ItemID order by Modifieddate desc ) as LATEST  
from client.QlinkTRansaction
where StatusCode<>401 --and JSON_VALUE(REsponse,'$.RequestGUID') = '00000000-0000-0000-0000-000000000000'
AND QlinkTRansactionID in (1,2,3,4)
) QT

inner join [common].[QLinkTransactionType] QTT on QT.[QlinkTransactionTypeId] = QTT.id
where Itemtype='Policy' and QT.LATEST=1 
--order by policyid 
) QTR on POL.PolicyId = QTR.PolicyID

where POL.isdeleted =0 
and POL.ProductOptionId in (132,133) --(select productid from @productIds)  
and BR.ID in (96) --(select brokerid from @BROKERIDS) 



Declare @new_import_batch int 
select @new_import_batch = max(ImportBatch) from commission.PolicyImport
where processed=0

BEGIN TRANSACTION

-- Step 1: Delete identical records from new batch
DELETE FROM commission.PolicyImport
WHERE EXISTS (
    SELECT *
    FROM (
        SELECT PolicyNumber, LifeID, LifeStatus, PolicyStatus, MemberType, CommissionablePremium, ProductID, CollectionStatus
        FROM commission.PolicyImport
        WHERE ImportBatch < @new_import_batch
        And CurrentRecord=1
    ) AS prior
      WHERE prior.PolicyNumber = PolicyImport.PolicyNumber
        AND prior.LifeID = PolicyImport.LifeID
        AND prior.PolicyStatus = PolicyImport.PolicyStatus
        AND prior.MemberType = PolicyImport.MemberType
        AND prior.CommissionablePremium = PolicyImport.CommissionablePremium
        AND prior.ProductID = PolicyImport.ProductID
        AND prior.LifeStatus = PolicyImport.LifeStatus
     
    )
    AND PolicyImport.ImportBatch =  @new_import_batch

-- Step 2: Update remaining records from new batch
UPDATE commission.PolicyImport
SET RecordVersion = isnull(RecordVersion,0) + 1,
    CurrentRecord = 1
WHERE ImportBatch = @new_import_batch;

-- Step 3: Update prior batch records
WITH MaxVersions AS (
  SELECT PolicyNumber, LifeID, MAX(RecordVersion) AS MaxVersion
  FROM commission.PolicyImport PI1
  INNER JOIN
  (select PolicyNumber as PN2, LifeID LI2 from commission.PolicyImport where ImportBatch=@new_import_batch ) PI2
  on PI2.PN2=PI1.PolicyNumber and PI2.LI2=PI1.LifeID
  WHERE ImportBatch < @new_import_batch
and CurrentRecord=1
  GROUP BY PolicyNumber, LifeID
)
UPDATE commission.PolicyImport
SET CurrentRecord = 0
FROM commission.PolicyImport
INNER JOIN MaxVersions
  ON MaxVersions.PolicyNumber = commission.PolicyImport.PolicyNumber
  AND MaxVersions.LifeID = commission.PolicyImport.LifeID
WHERE ImportBatch < @new_import_batch and CurrentRecord=1;


WITH MaxVersions AS (
  SELECT PolicyNumber, LifeID, MAX(RecordVersion) AS MaxVersion
  FROM commission.PolicyImport
  WHERE ImportBatch <> @new_import_batch
  GROUP BY PolicyNumber, LifeID
)
UPDATE commission.PolicyImport
SET RecordVersion = MaxVersions.MaxVersion + 1
FROM commission.PolicyImport
INNER JOIN MaxVersions
  ON MaxVersions.PolicyNumber = commission.PolicyImport.PolicyNumber
  AND MaxVersions.LifeID = commission.PolicyImport.LifeID
WHERE ImportBatch = @new_import_batch;


COMMIT TRANSACTION


--UPDATE IMPORT BATCH NUMBER BASED ON GROUPINGS OF WEEKS BASED ON QADD DATES
UPDATE commission.PolicyImport
SET ImportBatch = CalcBatch
FROM 
(
Select DENSE_RANK() OVER ( order by DATEADD(DAY,(CASE DATEPART(DW,PolicyQADDDate) 
                    WHEN 7 THEN 6 
                    ELSE 6 - DATEPART(DW,PolicyQADDDate) END),PolicyQADDDate) asc) as CalcBatch, RowID
from Commission.PolicyImport) BUP
where BUP.rowid=commission.PolicyImport.Rowid


--UPDATE IMPORT BATCH WITH CommisionablePremiumDelta WHERE THERE HAS BEEN A CHANGE IN PREMIUM.
UPDATE PI 
SET CommissionablePremiumDelta = PI.CommissionablePremium - [prior].CommissionablePremium
FROM commission.PolicyImport PI
INNER JOIN commission.PolicyImport [prior]  
  ON PI.PolicyNumber = prior.PolicyNumber
  AND PI.LifeID = [prior].LifeID
  AND PI.RecordVersion = [prior].RecordVersion +1
  AND [prior].processed=1
WHERE PI.CurrentRecord=1;


END;
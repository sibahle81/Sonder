/*
DROP PROCEDURE IF EXISTS commission.SP_UpFrontCommCalc
*/

CREATE PROCEDURE commission.SP_UpFrontCommCalc
@ScheduleID INT 

AS BEGIN

--DECLARE @ScheduleID INT =1

DECLARE @ConfigID INT
select @ConfigID = ConfigID from commission.CommSchedule where ID=@ScheduleID


Declare @new_import_batch int 
select @new_import_batch = max(ImportBatch) from commission.PolicyImport
where processed=0





insert into commission.UpFrontCommissionCalc

(   PolicyImportBatch,
    PolicyImportRow,
    PolicyNumber ,
    MemberType, 
    MemberRecord ,
    LifeDOB,
    CommTypeID ,
    YearstoExit,
    CommissionablePremium,
    PolicyInceptionDate,
    PolicyCancelDate,
    CommStatus
)
Select 
ImportBatch,
rowid,
PolicyNumber, 
MemberType,
LifeID as MemberRecord, 
LifeDOB,
1 as CommTypeID, 
CASE 
 WHEN 75-(1+Datediff(year,LifeDOB,PolicyInceptionDate)) <0 THEN 0
 WHEN 75-(1+Datediff(year,LifeDOB,PolicyInceptionDate)) between 0 and 10 THEN 10
     ELSE (75-(Datediff(year,LifeDOB,PolicyInceptionDate)+1))   
END as yearstoexit ,
CommissionablePremium,
convert(date,PolicyInceptionDate) as PolicyInceptionDate,
CASE When Policystatus in ('Cancelled', 'Pending Cancelled') THEN statusdate
ELSE getdate() END as PolicyCancelDate,
'Comm Setup'
from commission.PolicyImport
where currentRecord=1 and processed=0 and CollectionStatus in ('QADDOk','QUPDOk') and membertype <> 'Child' and LifeStatus='Active' and PolicyStatus in ('Active','Free Cover')

/* EXTRACT SETUP VALUES FOR COMM IN CURRENT BATCH  */
insert into commission.UpFrontCommissionCalc

(   PolicyImportBatch,
    PolicyImportRow,
    PolicyNumber ,
    MemberType, 
    MemberRecord ,
    LifeDOB,
    CommTypeID ,
    YearstoExit,
    CommissionablePremium,
    PolicyInceptionDate,
    PolicyCancelDate,
    commstatus
)
Select 
PolicyImportBatch,
PolicyImportRow,
PolicyNumber, 
MemberType,
LifeID as MemberRecord, 
LifeDOB,
1 as CommTypeID, 
Case WHEN 
(22-(Datediff(year,LifeDOB,PolicyInceptionDate)+1)) < 0 THEN 0
ELSE (22-(Datediff(year,LifeDOB,PolicyInceptionDate)+1)) END as yearstoexit ,
CommissionablePremium,
convert(date,PolicyInceptionDate) as PolicyInceptionDate,
CASE When Policystatus in ('Cancelled', 'Pending Cancelled') THEN statusdate
ELSE getdate() END as PolicyCancelDate,
'Comm Setup'
from 
(
select distinct
       max([ImportBatch]) as PolicyImportBatch
       ,min(rowid) as PolicyImportRow
      ,[PolicyNumber]
      ,[ProductID]
      ,[PolicyStatus]
      ,[PolicyInceptionDate]
      ,[statusdate]
      , Min([LifeID]) as LifeID
      ,[MemberType]
      , Max([LifeDOB]) as LifeDOB
      , Max([CommissionablePremium]) as CommissionablePremium
      ,[AffordabilityStatus]
      ,[CollectionStatus]
      ,[FirstCollectionMonth]
      ,[CurrentRecord]
      ,[processed]
     from commission.PolicyImport
where currentRecord=1 
and processed=0 
and CollectionStatus in ('QADDOk','QUPDOk') and membertype = 'Child' and LifeStatus='Active' and PolicyStatus in ('Active','Free Cover')
Group By       

      [PolicyNumber]
      ,[ProductID]
      ,[PolicyStatus]
      ,[PolicyInceptionDate]
      ,statusdate
      ,[MemberType]
      ,[AffordabilityStatus]
      ,[CollectionStatus]
      ,[FirstCollectionMonth] 
      ,[CurrentRecord]
      ,[processed]
) PI
where currentRecord=1 and processed=0 and CollectionStatus in ('QADDOk','QUPDOk') and membertype = 'Child' and PolicyStatus in ('Active','Free Cover')





/*EXTRACT SETUP VALUES FOR COMM IN CURRENT BATCH for Clawback Amounts for QDELs for non-children*/
insert into commission.UpFrontCommissionCalc

(   PolicyImportBatch,
    PolicyImportRow,
    PolicyNumber ,
    MemberType, 
    MemberRecord ,
    LifeDOB,
    CommTypeID ,
    YearstoExit,
    CommissionablePremium,
    PolicyInceptionDate,
    PolicyCancelDate,
    CommStatus
)
Select 
ImportBatch,
rowid,
PolicyNumber, 
MemberType,
LifeID as MemberRecord, 
LifeDOB,
1 as CommTypeID, 
CASE 
 WHEN 75-(1+Datediff(year,LifeDOB,PolicyInceptionDate)) <0 THEN 0
 WHEN 75-(1+Datediff(year,LifeDOB,PolicyInceptionDate)) between 0 and 10 THEN 10
     ELSE (75-(Datediff(year,LifeDOB,PolicyInceptionDate)+1))   
END as yearstoexit ,
CommissionablePremium,
convert(date,PolicyInceptionDate) as PolicyInceptionDate,
CASE When Policystatus in ('Cancelled', 'Pending Cancelled') THEN statusdate
ELSE getdate() END as PolicyCancelDate,
'Clawback Setup'
from commission.PolicyImport
where currentRecord=1 
and processed=0 
--and CollectionStatus in ('QDELOk')
and 
(
    CollectionStatus in ('QDELOk','QTODOk','QTOSOk','QTOROk','QADD Employee-s service termin','QTOTOk') or (PolicyStatus in ('Pending Cancelled', 'Cancelled') AND statusdate <= PolicyInceptionDate)
) 
and membertype <> 'Child' and LifeStatus='Active'

/* EXTRACT SETUP VALUES FOR COMM IN CURRENT BATCH for Clawback Amounts for QDELs for children */
insert into commission.UpFrontCommissionCalc

(   PolicyImportBatch,
    PolicyImportRow,
    PolicyNumber ,
    MemberType, 
    MemberRecord ,
    LifeDOB,
    CommTypeID ,
    YearstoExit,
    CommissionablePremium,
    PolicyInceptionDate,
    PolicyCancelDate,
    commstatus
)
Select 
PolicyImportBatch,
PolicyImportRow,
PolicyNumber, 
MemberType,
LifeID as MemberRecord, 
LifeDOB,
1 as CommTypeID, 
Case WHEN 
(22-(Datediff(year,LifeDOB,PolicyInceptionDate)+1)) < 0 THEN 0
ELSE (22-(Datediff(year,LifeDOB,PolicyInceptionDate)+1)) END as yearstoexit ,
CommissionablePremium,
convert(date,PolicyInceptionDate) as PolicyInceptionDate,
CASE When Policystatus in ('Cancelled', 'Pending Cancelled') THEN statusdate
ELSE getdate() END as PolicyCancelDate,
'Clawback Setup'
from 
(
select distinct
       max([ImportBatch]) as PolicyImportBatch
       ,min(rowid) as PolicyImportRow
      ,[PolicyNumber]
      ,[ProductID]
      ,[PolicyStatus]
      ,[PolicyInceptionDate]
      ,statusdate
      , Min([LifeID]) as LifeID
      ,[MemberType]
      , Max([LifeDOB]) as LifeDOB
      , Max([CommissionablePremium]) as CommissionablePremium
      ,[AffordabilityStatus]
      ,[CollectionStatus]
      ,[FirstCollectionMonth]
      ,[CurrentRecord]
      ,[processed]
     from commission.PolicyImport
where currentRecord=1 
and processed=0 
--and CollectionStatus in ('QDELOk')
and 
(
    CollectionStatus in ('QDELOk','QTODOk','QTOSOk','QTOROk','QADD Employee-s service termin','QTOTOk') or (PolicyStatus in ('Pending Cancelled', 'Cancelled') AND statusdate <= PolicyInceptionDate)
) 
and membertype = 'Child' 
and LifeStatus='Active'
Group By       

      [PolicyNumber]
      ,[ProductID]
      ,[PolicyStatus]
      ,[PolicyInceptionDate]
      ,statusdate
      ,[MemberType]
      ,[AffordabilityStatus]
      ,[CollectionStatus]
      ,[FirstCollectionMonth] 
      ,[CurrentRecord]
      ,[processed]
) PI
where currentRecord=1 and processed=0  
--and CollectionStatus in ('QDELOk')
and 
(
    CollectionStatus in ('QDELOk','QTODOk','QTOSOk','QTOROk','QADD Employee-s service termin','QTOTOk') or (PolicyStatus in ('Pending Cancelled', 'Cancelled') AND statusdate <= PolicyInceptionDate)
) 
and membertype = 'Child'



/* CALCUALTE SETUP VALUES FOR COMM IN CURRENT BATCH  */
UPDATE commission.UpFrontCommissionCalc
SET LTComm = CommissionablePremium*12*YearstoExit*0.0325,
YR85Comm = CommissionablePremium*12*0.85
--where CommStatus='Comm Setup'

/* CALCUALTE PRIMARY AND SECONDARY COMM and CLAWBACK FROM AVAILABLE SETUP VALUES - CHANGE STATUS FROM SETUP TO CALCULATED  */
UPDATE commission.UpFrontCommissionCalc
SET PrimaryComm = CASE WHEN LTComm < YR85Comm THEN LTComm ELSE YR85Comm END,
SecondaryComm = 0.33 * CASE WHEN LTComm < YR85Comm THEN LTComm ELSE YR85Comm END,
CalcDate = GetDate(), 
CommStatus = 'Comm Calculated'
where CommStatus='Comm Setup'




UPDATE commission.UpFrontCommissionCalc
SET PrimaryComm =  -
CASE WHEN LTComm < YR85Comm THEN LTComm * PrimaryClawbackPerc
ELSE YR85Comm  END * CASE WHEN PrimaryClawbackPerc is NULL THEN 1 ELSE PrimaryClawbackPerc END,
SecondaryComm = -0.33 * CASE WHEN LTComm < YR85Comm THEN LTComm ELSE YR85Comm END * CASE WHEN SecondaryClawbackPerc is NULL THEN 1 ELSE SecondaryClawbackPerc END,
CalcDate = GetDate(), 
CommStatus = 'Clawback Calculated'
from commission.UpFrontCommissionCalc UCC
left JOIN common.UpfrontCommClawbackratio UCBR on 
CASE 
WHEN DateDiff(month,UCC.PolicyInceptionDate,UCC.PolicyCancelDate) <0 THEN 0 
WHEN DateDiff(month,UCC.PolicyInceptionDate,UCC.PolicyCancelDate) >24 THEN 24 
ELSE DateDiff(month,UCC.PolicyInceptionDate,UCC.PolicyCancelDate) END =UCBR.MonthsSinceInception
where CommStatus='Clawback Setup'

update commission.UpfrontCommissionCalc 
set lifeDOb =  UPDOB.oldestchild
from commission.UpfrontCommissioncalc UCC
inner join 
(  select policynumber, Max(LIfeDOB) as youngestchild, min(LifeDob) as oldestchild from commission.policyImport 
   where policynumber in (select policynumber from commission.UpfrontCommissionCalc where MemberType='Child')
   and MemberType='Child'
   group by policynumber
) UPDOB 
on UPDOB.policynumber=UCC.policynumber
Where membertype='child'

Declare @COMMBATCH int
SELECT @COMMBATCH = MAX (CommBatchID) +1 from commission.PolicyCommission
 SELECT @COMMBATCH= ISNULL(@COMMBATCH,1)

/* Create Policy-level commission record for all upfront PRIMARY comm calcs with paydate on next friday */
Insert into commission.PolicyCommission
(
    CommBatchID ,
    PolicyNumber ,
    CommTypeID ,
    CommReason ,
    CommissionablePremium,
    CommDue ,
    CommRetention ,
    CalcDate ,
    PayDate,
    PolicyInceptionDate,
    PolicyCancelDate,
    CommStatus 
   )
Select 
@COMMBATCH as CommBatchID,
PolicyNumber,
1 as CommTypeID,
'New Primary Commission' as CommReason,
Sum(UCC.CommissionablePremium) as CommissionablePremium,
Sum(PrimaryComm) as CommDue,
0 as CommRetention, 
CalcDate as CalcDate, 
DATEADD(DAY,(CASE DATEPART(DW,GETDATE()) 
                    WHEN 7 THEN 6 
                    ELSE 6 - DATEPART(DW,GETDATE()) END),GETDATE()) as PayDate,
PolicyInceptionDate,
PolicyCancelDate,
'Batched'
from commission.UpFrontCommissionCalc UCC
Where CommStatus='Comm Calculated'
group by Policynumber,PolicyInceptionDate,PolicyCancelDate,CommStatus, CalcDate


/* Create Policy-level commission record for all upfront SECONDARY comm calcs with future dated paydate */
Insert into commission.PolicyCommission
(
    CommBatchID ,
    PolicyNumber ,
    CommTypeID ,
    CommReason ,
    CommissionablePremium,
    CommDue ,
    CommRetention ,
    CalcDate ,
    PayDate ,
    PolicyInceptionDate,
    PolicyCancelDate,
    CommStatus 
   )
Select 
@COMMBATCH as CommBatchID,
PolicyNumber,
1 as CommTypeID,
'New Secondary Commission' as CommReason,
Sum(UCC.CommissionablePremium) as CommissionablePremium,
Sum(SecondaryComm) as CommDue,
0 as CommRetention, 
CalcDate as CalcDate, 
DATEADD(DAY,(CASE DATEPART(DW,GETDATE()) 
                    WHEN 7 THEN 6 
                    ELSE 6 - DATEPART(DW,GETDATE()) END),DATEADD(Month,12,GETDATE())) as PayDate,
PolicyInceptionDate,
PolicyCancelDate,
'Batched'
from commission.UpFrontCommissionCalc UCC
Where CommStatus='Comm Calculated' and Datediff(month,getdate(),CalcDate)=0  
group by Policynumber,PolicyInceptionDate,PolicyCancelDate,CommStatus, CalcDate


/* Create Policy-level Clawback record for all upfront PRIMARY comm calcs with future dated paydate */
Insert into commission.PolicyCommission
(
    CommBatchID ,
    PolicyNumber ,
    CommTypeID ,
    CommReason ,
    CommissionablePremium,
    CommDue ,
    CommRetention ,
    CalcDate ,
    PayDate,
    PolicyInceptionDate,
    PolicyCancelDate,
    CommStatus 
   )
Select 
@COMMBATCH as CommBatchID,
PolicyNumber,
1 as CommTypeID,
'Clawback Primary Commission' as CommReason,
Sum(UCC.CommissionablePremium) as CommissionablePremium,
Sum(PrimaryComm) as CommDue,
0 as CommRetention, 
CalcDate as CalcDate, 
DATEADD(DAY,(CASE DATEPART(DW,GETDATE()) 
                    WHEN 7 THEN 6 
                    ELSE 6 - DATEPART(DW,GETDATE()) END),GETDATE()) as PayDate,
PolicyInceptionDate,
PolicyCancelDate,
'Batched'
from commission.UpFrontCommissionCalc UCC
Where CommStatus='Clawback Calculated'
group by Policynumber,PolicyInceptionDate,PolicyCancelDate,CommStatus, CalcDate


/* Create Policy-level Clawback record for all upfront SECONDARY comm calcs with future dated paydate */
Insert into commission.PolicyCommission
(
    CommBatchID ,
    PolicyNumber ,
    CommTypeID ,
    CommReason ,
    CommissionablePremium,
    CommDue ,
    CommRetention ,
    CalcDate ,
    PayDate ,
    PolicyInceptionDate,
    PolicyCancelDate,
    CommStatus 
   )
Select 
@COMMBATCH as CommBatchID,
PolicyNumber,
1 as CommTypeID,
'Clawback Secondary Commission' as CommReason,
Sum(UCC.CommissionablePremium) as CommissionablePremium,
Sum(SecondaryComm) as CommDue,
0 as CommRetention, 
CalcDate as CalcDate, 
DATEADD(DAY,(CASE DATEPART(DW,GETDATE()) 
                    WHEN 7 THEN 6 
                    ELSE 6 - DATEPART(DW,GETDATE()) END),DATEADD(Month,12,GETDATE())) as PayDate,
PolicyInceptionDate,
PolicyCancelDate,
'Batched'
from commission.UpFrontCommissionCalc UCC
Where CommStatus='Clawback Calculated' and Datediff(month,getdate(),CalcDate)=0  
group by Policynumber,PolicyInceptionDate,PolicyCancelDate,CommStatus, CalcDate


/* SET Comm status to "Batched" for new batch */
UPDATE commission.UpfrontCommissionCalc
SET CommStatus='Batched'
WHERE PolicyNumber in (select PolicyNumber from commission.PolicyCommission where CommStatus='Batched') 

/* SET Comm status to Processed for new batch */
UPDATE commission.PolicyImport
SET processed=1
WHERE PolicyNumber in (select PolicyNumber from commission.PolicyCommission where CommStatus='Batched') and currentrecord=1


END;

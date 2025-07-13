import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DebtcareApiService } from '../../services/debtcare-api.service';
import { format } from 'date-fns';
import { FileDownloadService } from '../../services/file-download.service';
import { ExportFileService } from 'projects/marketingcare/src/app/marketing-manager/services/export-file.service';
import { DebtCareService } from '../../services/debtcare.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { BookClassEnum } from 'projects/shared-models-lib/src/lib/enums/debtcare-book-class.enum';
import { ReportsClassEnum } from 'projects/shared-models-lib/src/lib/enums/debtor-reports.enum';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-debtcare-reports',
  templateUrl: './debtcare-reports.component.html',
  styleUrls: ['./debtcare-reports.component.css']
})
export class DebtcareReportsComponent implements OnInit{

  reportForm: FormGroup;
  reportTypes = ReportsClassEnum;
  reportListValues = [];
  classList = BookClassEnum;
  classListValues = [];
  statusList = [];
  collectionAgentList = [];
  reportResponse = [];
  selectedStatusoption = [];
  selectedCollectionAgentOption = [];
  isPdf: boolean = true;
  isSpinner: boolean = false;
  isDropdownOpen: boolean = false;
  formSubmitted: boolean = false;
  isStatusClassHide: boolean = false;
  isCollectionAgentClassHide: boolean = false;
  selectedCollectionAgentDisplayName: string = '';
  constructor(private fb: FormBuilder,
    private debtcareApiService: DebtcareApiService,
    private fileDownloadService: FileDownloadService,
    private excelService: ExportFileService,
    private debtCareService: DebtCareService
  ){}

  ngOnInit(): void{

    var currentDate = new Date();
    var currentDateMin30 = new Date(new Date().setDate(currentDate.getDate() - 30));

    var currentDatestring = currentDate.toISOString().split('T')[0];
    var currentDateMin30string = currentDateMin30.toISOString().split('T')[0];

    this.getDebtcareStatusList();
    this.getDebtcareCollectionAgentList();
    this.getReportsData();
    this.getClassData();
    this.getReportForm(currentDatestring,currentDateMin30string);
  }

  getClassData() {
    this.classListValues = [];
    for (const value in this.classList) {
      if (typeof(this.classList[value]) === 'string') {
        this.classListValues.push(this.classList[value]);
      } 
    }
  }

  getReportsData() {
    this.reportListValues = [];
    for (const value in this.reportTypes) {
      if (typeof(this.reportTypes[value]) === 'string') {
        this.reportListValues.push(this.reportTypes[value]);
      }
    }
  }
  
 
  getDebtcareStatusList(): void{
    this.selectedStatusoption = [];
    this.debtCareService.getStatusList('0').subscribe(res => {
      if (res && res.data) {
        this.statusList = res.data;
        this.selectedStatusoption = [...this.statusList]
        this.isSpinner = false;
      } else {
        this.statusList = [];
        this.selectedStatusoption = [];
        this.isSpinner = false;
      }
    })
  }

  getDebtcareCollectionAgentList(): void{
    this.selectedCollectionAgentOption = [];
    this.debtCareService.getCollectionAgentList().subscribe(res => {
      if (res && res.data) {
        this.collectionAgentList = res.data;
        this.selectedCollectionAgentOption = [...this.collectionAgentList]
        this.isSpinner = false;
      } else {
        this.collectionAgentList = [];
        this.selectedCollectionAgentOption = [];
        this.isSpinner = false;
      }
    })
  }

  getReportForm(Cdate:string, CMdate :string): void{
    this.reportForm = this.fb.group({
      reportType: ['All'],
      status: ['All'],
      collection_agent: ['0'],
      collection_agent_id: ['All'],
      fromDate: CMdate,
      toDate: Cdate,
      fromAge: ['0',[Validators.pattern('^[0-9]{1,2}$')]],
      toAge: ['0', [Validators.pattern('^[0-9]{1,2}$')]],
      bookClass: ['All'],
      search: ['All'],
    }) 
  }

  getCollectionAgentDisplayName(): string {
    const selectedId = this.reportForm.get('collection_agent')?.value;
    const selectedAgent = this.selectedCollectionAgentOption.find(item => item.id === selectedId);
    return selectedAgent ? selectedAgent.displayName : '';
  }  

  enableDropdownOptions() {
    this.isDropdownOpen = !this.isDropdownOpen;  
    setTimeout(() => {
      const dropdownPanel = document.querySelector('.mat-autocomplete-panel');
      if (dropdownPanel) {
        if (this.isDropdownOpen) {
          dropdownPanel.classList.add('visible');
        } else {
          dropdownPanel.classList.remove('visible');
        }
      }
    });
  }

  onSelectReportType(e: MatSelectChange): void {
    if (e.value === 'Productivity Report') {
      this.isStatusClassHide = true;
      this.isCollectionAgentClassHide = false;
    } else if (e.value === 'Book Performance') {
      this.isStatusClassHide = true;
      this.isCollectionAgentClassHide = false;
    } else {
      this.isStatusClassHide = false;
      this.isCollectionAgentClassHide = true;
    }
  }

  onSelectStatus(event: MatAutocompleteSelectedEvent): void {
    this.reportForm.get('status').setValue(event.option.viewValue);
  }

  onSelectCollectionAgent(event: MatAutocompleteSelectedEvent): void {
    this.reportForm.get('collection_agent').setValue(event.option.value);
    this.selectedCollectionAgentDisplayName = event.option.viewValue;
  }

  onSelectBookClass(e: Event): void{
  }

  searchValueStatus(searchText: string): void {
    if (searchText.length > 0 && this.statusList) {
      const filterValue = searchText.toLowerCase();
      this.selectedStatusoption = this.statusList.filter(o => o.statusCategoryName.toLowerCase().includes(filterValue));
    } else {
      this.selectedStatusoption = [...this.statusList || []];
    }
  }

  searchValueCollectionAgent(searchText: string): void {
    if (searchText.length > 0 && this.collectionAgentList) {
      const filterValue = searchText.toLowerCase();
      this.selectedCollectionAgentOption = this.collectionAgentList.filter(o => o.displayName.toLowerCase().includes(filterValue));
    } else {
      this.selectedCollectionAgentOption = [...this.collectionAgentList || []];
    }
  }

  exportDebtcareReport(isOptionPdf: boolean): void{
    this.formSubmitted = true;
    if(!this.reportForm.invalid){
    const reportDetails = {
      ...this.reportForm.value,
      fromDateValue: format(new Date(this.reportForm.value.fromDate), "yyyyMMdd"),
      toDateValue: format(new Date(this.reportForm.value.toDate), "yyyyMMdd"),
    }
    this.isSpinner = true;
    
    this.debtcareApiService.getDebtcareReport(reportDetails).subscribe((res) => {
      if(res && res.data){
        this.reportResponse = res.data;
        this.exportFile(isOptionPdf);
      }else{
        this.isSpinner = false;
        }
      })
    }
  }

  exportFile(optionPdf: boolean): void {
    const data = (this.reportResponse && this.reportResponse?.length > 0) ? this.reportResponse : [];
    let formattedData = [];
    
    if(data?.length > 0){
      if (this.reportForm.get('reportType').value === 'Productivity Report') {
        formattedData = data.map((item) => {
          return {
            "Collection Agents": item.collectionAgent,
            "Date": item.createdDate,
            "Log On Time": item.logOnTime,
            "Number Of Calls Made Today": item.numberOfCallsMadeToday,
            "Number Of Calls Received Today": item.numberOfCallsReceivedToday,
            "Total Number Of Calls Made and Received Today": item.totalNumberOfCallsMadeandReceivedToday,
            "Number of Private Calls Made Today":item.numberofPrivateCallsMadeToday,
            "Number of Terms Arrangements Made Today": item.numberofTermsArrangementsmadetoday,
            "Value of Terms Arrangements Made Today": item.valueofTermsArrangementsmadetoday,
            "Total Cumulative Terms Arrangements Value": item.totalCummulativeTermsarrangementsValue,
            "Total Cumulative Terms Arrangements Number of Accounts": item.totalCummulativeTermsarrangementsNumberofAccounts,
            "Today's Strike Rate (Calls Made/Received turning to Arrangements)": item.todaysStrikeRatenumberofcallsmadeandrecievedwhichturntoArrangementPtpsandTermsArrangements,
            "PTPs Made": item.ptpsMade,
            "Value of PTPs Made": item.valuePtpsMade,
            "Average Call Duration": item.averageCallDuration,
            "Total Call Duration": item.totalCallDuration,
            "Amount Collected Today": item.amountCollectedToday,
            "Number of Accounts Collected Today (Separate Credit Notes from Cash)": item.numberofaccountsCollectedTodayseparatecreditnotesfromcashinthebank,
            "Accumulated Amount Collected This Month (Separate Credit Notes)": item.accumulatedAmountCollectedDuringtheMonthtoDateseparatecreditnotesfromcashinthebank,
            "Accumulated Number of Accounts Collected This Month": item.accumulatednumberofaccountsCollectedDuringtheMonthtoDate,
            "Number of Accounts Escalated to Team Leader": item.numberofaccountsescalatedtoteamleader,
            "Value of Accounts Escalated to Team Leader": item.valueofaccountsescalatedtoteamleader,
            "Number of Accounts Sent to Membership": item.numberofaccountssenttoMembership,
            "Value of Accounts Sent to Membership": item.valueofaccountssenttoMembership,
            "Number of Accounts Sent to Pre-Legal": item.numberOfaccountssentToPreLegal,
            "Value of Accounts Sent to Pre-Legal": item.valueOfaccountssentToPreLegal,
            "Number of Accounts Sent to Legal": item.numberofaccountssenttoLegal,
            "Value of Accounts Sent to Legal": item.valueofaccountssenttoLegal,
            "Number of Accounts Sent to Claims": item.numberofaccountssenttoClaims,
            "Value of Accounts Sent to Claims": item.valueofaccountssenttoClaims,
            "Number of Accounts Sent to Trace": item.numberofaccountssenttoTrace,
            "Value of Accounts Sent to Trace": item.valueofaccountssenttoTrace,
            "Number of Accounts Not Worked on in 30 Days": item.numberofaccountsnotworkedonin30days,
            "Value of Accounts Not Worked on in 30 Days": item.valueofaccountsnotworkedonin30days,
            "Number of accounts Worked on (All)": item.numberofaccountsWorkedonAll,
            "Value of accounts Worked on (All)": item.valueofaccountsWorkedonAll,
            "Number of Accounts Worked on (Called)": item.numberofaccountsWorkedonCalled,
            "Value of Accounts Worked on (Called)": item.valueofaccountsWorkedonCalled,
            "Number of Accounts Turned to Broken PTP": item.numberofaccountsturnedtoBrokenPtp,
            "Value of Accounts Turned to Broken PTP": item.valueofaccountsturnedtoBrokenPtp,
            "Number of Emails Sent (Not Automated)": item.numberofEmailsSentNotAutomated,
            "Number of SMS Messages Sent": item.numberofSMSMessagesSent,
            "Percentage of Outgoing Calls Resulting in RPC Calls": item.percentageofOutgoingcallsthatresultedinRPCcalls,
            "Percentage of Outgoing calls that resulted in RPC: value of book": item.percentageofOutgoingcallsthatresultedinRPCvalueofbook,
            "Book Value of Accounts Allocated per Collections Agent": item.bookvalueofaccountsallocatedperCollectionsAgent,
            "Number of Accounts Allocated per Collections Agent": item.numberofaccountsallocatedperCollectionsAgent,
            "Average Collection per File Allocated per Collections Agent": item.averageCollectionperFileAllocatedperCollectionsAgent,
            "Target for the Year": item.targetfortheYear,
            "Target for the Month": item.targetfortheMonth,
            "Target for the Day": item.targetfortheDay,
            "Accumulated Target for the Day": item.accumulatedtargetfortheDay,
            "Target vs Collected": item.targetvsCollected,
            "Lapse/idle time": item.pIT,
            "Breaks": item.breaks,
            "Meeting Time": item.meetingtime,
            "Flag for Longer Time Spent": item.flagforlongertimespend,
            "Log Off Time": item.logOffTime            
        };
        });
      } else if (this.reportForm.get('reportType').value === 'Book Performance') {
        formattedData = data.map((item) => {
          return {
            "Collection Agents": item.collectionAgent,
            "Opening Book No of Accounts": item.numberOFAccounts,
            "Opening Book Rand Value": item.openingRandValue,
            "Opening Terms No of Accounts": item.noOfAccountsTerms,
            "Opening Terms Rand Value": item.openingTermsRandValue,
            "Opening Total No of Accounts": item.totalOpeningAccounts,
            "Opening Total Rand Value": item.totalRandValue,
            "Additional No of Accounts": item.numberOfaccountsAdditional,
            "Additional Rand Value": item.additionalRandValue,
            "Accounts Settled No of Accounts": item.numberOfSettledAccounts,
            "Accounts Settled Rand Value": item.settledRandValue,
            "Risk Accounts No of Accounts": item.riskAccounts,
            "Risk Accounts Rand Value": item.riskRandValue,
            "Partly Paid No of Accounts": item.partlyPaidAccounts,
            "Partly Paid Rand Value": item.partlyPaidRandValue,
            "Terms Paid No of Accounts": item.termsPaidAccounts,
            "Terms Paid Rand Value": item.termsPaidRandValue,
            "Total Reduced No of Accounts": item.totalReducedAccounts,
            "Total Reduced Rand Value": item.totalReducedRandValue,
            "Total Excluding Risk No of Accounts": item.totalExcludintRisk,
            "Total Excluding Risk Rand Value": item.totalExcludingRiskRandValue,
            "Closing Book No of Accounts": item.numberOFClosingAccounts,
            "Closing Book Rand Value": item.closingRandValue,
            "Closing Terms No of Accounts": item.closingTermsAccounts,
            "Closing Terms Rand Value": item.closingTermsRandValue
        };
        });
      } else if (this.reportForm.get('reportType').value === 'Book Age') {
        formattedData = data.map((item) => {
          return {
            "Policy Id": item.policyId,
            "Book": item.book,
            "Status": item.status,
            "Last Change Date": item.lastChangeDate ? item.lastChangeDate.split('T')[0] : '',
            "Last Changed By": item.lastChangedBy ? item.lastChangedBy : '',
            "Account Age": item.accountAge,
            "Member Number": item.memberNumber,
            "Notes 1": item.notes1,
            "Notes 2": item.notes2,
            "Notes 3": item.notes3,
            "Notes 4": item.notes4,
            "Current Balance": item.currentBalance,
            "Balance 30 Days": item.balance30Days,
            "Balance 60 Days": item.balance60Days,
            "Balance 90 Days": item.balance90Days,
            "Balance 120 Days": item.balance120Days,
            "Net Balance": item.netBalance,
            "Interest Amount": item.intrestAmount,
            "Collection Agent": item.collectionAgentName,
        }
        })
      }
      let currentTime = format(new Date(),'yyMMddHHmmss')
      if(optionPdf){
        this.fileDownloadService.exportToPdf({data:formattedData,documentName: `Legal_action_logs_${currentTime}.pdf`,fontSize: 8},500);
        this.isSpinner = false;
      }else{
        this.excelService.exportAsExcelFile(formattedData, this.reportForm.get('reportType').value+'_');
        this.isSpinner = false;
      }
    }else{
      this.isSpinner = false;
    }
  }
  
  
}

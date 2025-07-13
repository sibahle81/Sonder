using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Common.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.ScheduledTasks.Tasks.Medical
{
    public class ProcessSwitchBatchInvoicesTask : IScheduledTaskHandler
    {
        public bool CanCompleteTask => false;
        private readonly ISwitchBatchService _switchBatchService;
        private readonly IInvoiceMedicalSwitchService _invoiceMedicalSwitchService;
        private readonly ICommonProcessorService _commonProcessorService;
        private readonly IHealthBridgeProcessorService _healthBridgeProcessorService;
        private readonly IMediSwitchProcessorService _mediSwitchProcessorService;
        private readonly ITebaProcessorService _tebaProcessorService;
        private readonly IConfigurationService _configurationService;
        private readonly IHttpClientService _httpClientService;
        private readonly IServiceBusMessage _serviceBusMessage;
        private readonly Dictionary<string, IProcessFile> _processFiles;

        public ProcessSwitchBatchInvoicesTask(ISwitchBatchService switchBatchService, IInvoiceMedicalSwitchService invoiceMedicalSwitchService,
            ICommonProcessorService commonProcessorService, IHealthBridgeProcessorService healthBridgeProcessorService,
            IMediSwitchProcessorService mediSwitchProcessorService, ITebaProcessorService tebaProcessorService,
            IConfigurationService configurationService, IServiceBusMessage serviceBusMessage, IHttpClientService httpClientService)
        {
            _switchBatchService = switchBatchService;
            _invoiceMedicalSwitchService = invoiceMedicalSwitchService;
            _commonProcessorService = commonProcessorService;
            _healthBridgeProcessorService = healthBridgeProcessorService;
            _mediSwitchProcessorService = mediSwitchProcessorService;
            _tebaProcessorService = tebaProcessorService;
            _configurationService = configurationService;
            _serviceBusMessage = serviceBusMessage;
            _processFiles = new Dictionary<string, IProcessFile>
            {
                {"MediKredit", new MediKredit(_commonProcessorService, _invoiceMedicalSwitchService)},
                {"Other", new Other(_healthBridgeProcessorService, _mediSwitchProcessorService, _commonProcessorService, _tebaProcessorService, _invoiceMedicalSwitchService)}
            };
            _httpClientService = httpClientService;
        }

        private interface IProcessFile
        {
            Task<int> ProcessFile(Switch medicalSwitch, string fileName, string content);
        }

        private IProcessFile CreateProcessFile(Switch switchDetail)
        {
            return string.Compare(switchDetail.FileFormat, "MediKredit", StringComparison.InvariantCultureIgnoreCase) == 0
                ? _processFiles["MediKredit"] : _processFiles["Other"];
        }

        public async Task<bool> ExecuteTask(int scheduledTaskId)
        {
            var switchBatchApiUrl = await _configurationService.GetModuleSetting(SystemSettings.SwitchBatchApiUrl);
            var switchBatchOcpApimSubscriptionKey = await _configurationService.GetModuleSetting(SystemSettings.SwitchBatchOcpApimSubscriptionKey);
            var serviceBusMessages = await _serviceBusMessage.GetSwitchBatchServiceBusMessages();
            long switchBatchId = 0;

            if (serviceBusMessages?.Count > 0)
            {
                foreach (var serviceBusMessage in serviceBusMessages)
                {
                    string batchReference = serviceBusMessage.MessageBody;

                    HttpClientSettings httpClientSettings = new HttpClientSettings();
                    httpClientSettings.AddDefaultRequestHeaderAccept("application/json");
                    httpClientSettings.AddDefaultRequestHeader("Ocp-Apim-Subscription-Key", switchBatchOcpApimSubscriptionKey);

                    using (var data = new StringContent(string.Empty, Encoding.UTF8, "application/json"))
                    {
                        var responseMessage = await _httpClientService.GetAsync(httpClientSettings, $"{switchBatchApiUrl}{batchReference}");
                        var responseString = await responseMessage.Content.ReadAsStringAsync();
                        var switchBatchAPIResponse = JsonConvert.DeserializeObject<SwitchBatchAPIResponse>(responseString);
                        if (switchBatchAPIResponse?.StatusCode.Equals("200") == true)
                        {
                            string fileName = switchBatchAPIResponse.FileName;
                            var content = switchBatchAPIResponse.Content;

                            var activeSwitches = await _switchBatchService.GetActiveSwitches().ConfigureAwait(true);
                            var medicalSwitch = activeSwitches.Find(s => s.Name.Equals(switchBatchAPIResponse.MedicalSwitch));
                            string message = $"Processing medical switch file {fileName}";

                            var processFile = CreateProcessFile(medicalSwitch);
                            switchBatchId = await processFile.ProcessFile(medicalSwitch, fileName, content);

                            serviceBusMessage.MessageProcessingStatusText = "Success";
                            await _serviceBusMessage.UpdateBusMessage(serviceBusMessage);
                        }
                    }
                }
            }

            return true;
        }

        private async Task<bool> MoveFileToCompletedOrFailedFolder(string switchFolder, string fileName, bool processSuccessful)
        {
            string fileNameOnly = Path.GetFileName(fileName);
            if (processSuccessful)
            {
                File.Move(fileName, switchFolder + @"\Processed\" + fileNameOnly);
            }
            else
            {
                File.Move(fileName, switchFolder + @"\Failed\" + fileNameOnly);
            }
            return true;
        }

        public Task CompleteTask(int detailsScheduledTaskId, bool success, TaskScheduleFrequencyEnum detailsTaskScheduleFrequency, TimeSpan executionDuration)
        {
            return Task.CompletedTask;
        }

        public Task DeleteTask(int detailsScheduledTaskId)
        {
            return Task.CompletedTask;
        }

        private class MediKredit : IProcessFile
        {
            private readonly ICommonProcessorService _commonProcessorService;
            private readonly IInvoiceMedicalSwitchService _invoiceMedicalSwitchService;

            public MediKredit(ICommonProcessorService commonProcessorService, IInvoiceMedicalSwitchService invoiceMedicalSwitchService)
            {
                _commonProcessorService = commonProcessorService;
                _invoiceMedicalSwitchService = invoiceMedicalSwitchService;
            }

            public async Task<int> ProcessFile(Switch switchDetail, string fileName, string content)
            {
                int switchBatchId = 0;
                string message = $"Processing medical switch {switchDetail.SwitchId} for file {fileName}";

                if (string.IsNullOrEmpty(switchDetail.DownloadFilePrefix) || fileName.Contains(switchDetail.DownloadFilePrefix))
                {
                    var csvContent = ConvertMedikreditDelimitedFileToCSV(content);
                    if (string.IsNullOrEmpty(csvContent))
                        return switchBatchId;

                    switchBatchId = await _commonProcessorService.ProcessFile(switchDetail, fileName, csvContent);
                }

                return switchBatchId;
            }

            private static string ConvertMedikreditDelimitedFileToCSV(string content)
            {
                StringBuilder stringBuilder = new StringBuilder();

                //Keep the first record of the file
                var myRecord3Updaded = new string[200][];

                if (string.IsNullOrEmpty(content))
                    return string.Empty;

                using (var reader = new StringReader(content))
                {
                    var lineCounter = 0;
                    var uploadFormattedStrings = new string[9800][]; //To load all strng arrays from the txt file
                    var record3Counter = 0;

                    //Load all string from the fill into string array
                    var line = reader.ReadLine();
                    while (line != null)
                    {
                        if (!string.IsNullOrEmpty(line))
                        {
                            line = line.Replace(',', '.'); //Remove any commas in the line that will mess up our csv
                            var recordString = ReadMedikreditFile(line);
                            //Upload each converted string array into an array
                            uploadFormattedStrings[lineCounter] = recordString;
                            lineCounter++;
                        }
                        line = reader.ReadLine();
                    }

                    StringWriter stringWriter = new StringWriter(stringBuilder);

                    var myRecord2 = new string[lineCounter];
                    var myRecord3 = new string[lineCounter];
                    var myRecord4 = new string[lineCounter];

                    var lineItermCounter = 0; //
                    var next9 = true; // false;

                    for (var y = 0; y < lineCounter; y++)
                    {
                        var latestMemberNumber = uploadFormattedStrings[y];

                        //Load Record 9
                        if (next9)
                            for (var x = y; x < lineCounter; x++)
                                if ((Convert.ToInt16(uploadFormattedStrings[x + 1][1])) == 9)
                                {
                                    x = lineCounter;
                                    next9 = false;
                                }

                        //Read infor for the first record
                        if (Convert.ToInt16(latestMemberNumber[1]) == 1)
                        {
                            var firstRecord = uploadFormattedStrings[y];
                            var batchNumber = firstRecord[6];
                            var batchDate = firstRecord[9];

                            stringWriter.WriteLine((y + 1) + "," + ",M," + firstRecord[2] + "," + batchNumber + "," + batchDate +
                                            "," + firstRecord[5] + ",,14,");
                        }

                        //Close writting file
                        if (stringWriter != null && Convert.ToInt16(latestMemberNumber[1]) == 9)
                        {
                            stringWriter.Write("Z" + "," + (lineItermCounter - 1) + "," +
                                        (Convert.ToDouble(latestMemberNumber[13]) / 100));
                            stringWriter.Close();
                            next9 = true;
                        }
                        //Supplier Batch Header record
                        if (Convert.ToInt16(latestMemberNumber[1]) == 2)
                        {
                            lineItermCounter = 1;
                            myRecord2 = uploadFormattedStrings[y];
                        }

                        //Claim Details
                        if (Convert.ToInt16(latestMemberNumber[1]) == 5)
                        {
                            myRecord3 = uploadFormattedStrings[y];
                            myRecord3Updaded[record3Counter] = uploadFormattedStrings[y];
                            ++record3Counter;

                            //Set Reversal status
                        }

                        //Claim Details
                        if (Convert.ToInt16(latestMemberNumber[1]) == 7)
                        {
                            myRecord4 = uploadFormattedStrings[y];
                        }
                        var testig = 0;
                        //Claim Details
                        if (Convert.ToInt16(latestMemberNumber[1]) == 8)
                        {
                            testig++;

                            if (myRecord3Updaded[testig - 1][5] == "02" || Convert.ToInt16(latestMemberNumber[1]) == 8)
                            {
                                if (stringWriter != null)
                                {
                                    //1
                                    stringWriter.Write("M" + ",");

                                    //2                            
                                    stringWriter.Write(lineItermCounter + ",");

                                    //3                            
                                    stringWriter.Write(myRecord3[45].Trim() + ",");

                                    //4
                                    stringWriter.Write("," + myRecord3[8].Trim());

                                    ////5
                                    //stringWriter.Write(",");

                                    //6
                                    stringWriter.Write("," + myRecord3[9].Trim());

                                    //Initials
                                    stringWriter.Write("," + myRecord3[11].Trim() + ",");

                                    //Dependents Num & Patiant`s 
                                    stringWriter.Write(myRecord3[10].Trim() + ",");

                                    //BHF Num
                                    stringWriter.Write(myRecord2[7] + ",");

                                    //Acc #
                                    stringWriter.Write("," + myRecord3[42].Trim());

                                    //Service Type
                                    stringWriter.Write(",M");

                                    //Service Date
                                    stringWriter.Write("," + myRecord3[39].Trim());

                                    //Quantity
                                    var qt = Convert.ToDouble(myRecord4[9].Trim()) / 10;

                                    stringWriter.Write("," + qt);

                                    var mySurcharge = Convert.ToDouble(myRecord4[18].Trim()) / 100;
                                    var myServiceAmount = Convert.ToDouble(myRecord4[12].Trim()) / 100;

                                    if (mySurcharge < myServiceAmount)
                                        myServiceAmount -= mySurcharge;

                                    //Service Amount
                                    stringWriter.Write("," + myServiceAmount + ",");

                                    //Discount
                                    stringWriter.Write(Convert.ToDouble(myRecord4[17].Trim()) / 100 + ",");

                                    //Med Desc
                                    stringWriter.Write(myRecord4[14].Trim() + ",");

                                    //Tarrif Code
                                    stringWriter.Write(",");

                                    //Service Fee
                                    stringWriter.Write("2,");

                                    //Modifiers
                                    stringWriter.Write(",,,,");

                                    //Script Num
                                    stringWriter.Write(myRecord3[42].Trim() + ",");


                                    //Practice Name
                                    stringWriter.Write(myRecord2[8].Trim() + ",");

                                    //Reff BHF Num
                                    stringWriter.Write(myRecord3[28].Trim() + ",");

                                    //Nappi Code
                                    stringWriter.Write(myRecord4[8].Trim() + ",");

                                    //Doc prac #
                                    stringWriter.Write(",");

                                    //Date Of Birth
                                    stringWriter.Write(myRecord3[37].Trim() + ",");

                                    //Provider #
                                    stringWriter.Write(myRecord3[43].Trim() + ",");

                                    //Hospital indicator
                                    stringWriter.Write(",");

                                    //Auth #
                                    stringWriter.Write(myRecord3[26].Trim() + ",");

                                    //Resup Flag
                                    stringWriter.Write(myRecord3[34].Trim() + ",");


                                    //Diag Codes
                                    stringWriter.Write(myRecord4[30].Trim() + ",");

                                    //Att BHF
                                    stringWriter.Write("," + myRecord4[42].Trim() + ",");

                                    //7 Blanks
                                    stringWriter.Write(",,,,,,");

                                    //Reason Code
                                    stringWriter.Write(myRecord4[46] + " = " + myRecord4[47] + " : " + myRecord4[48] + " = " +
                                                myRecord4[49] + " : " + myRecord4[50] + " = " + myRecord4[51] + " : " +
                                                myRecord4[52] + " = " + myRecord4[53] + " : " +
                                                myRecord4[54] + " = " + myRecord4[55] + ",");

                                    //31 Blanks
                                    stringWriter.Write(",,,,,,,,,,,,,,,,,,,," + myRecord3[39].Trim() + ",," + myRecord3[39].Trim() +
                                                ",,,,,,,,");


                                    //Insert a new line
                                    stringWriter.Write(stringWriter.NewLine);
                                    lineItermCounter++;

                                }
                            }
                        }
                    }
                    stringWriter.Flush();
                    stringWriter.Close();
                }

                return stringBuilder.ToString();
            }

            private static string[] ReadMedikreditFile(string line)
            {
                var requiredString = new string[69];
                var i = 0;
                var charPointer = 0;

                var stringLen = line.Length;

                int myRecordNo = Convert.ToInt16(line.Substring(7, 1));

                switch (myRecordNo)
                {
                    case 1: //Schedule Claim Header Record- Record Type Identifier
                        while (i <= 600)
                        {
                            switch (i)
                            {
                                case 7: //Sequence number
                                    requiredString[charPointer] = (stringLen > (charPointer + 1))
                                        ? line.Substring(charPointer, 7)
                                        : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 8:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 9:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 14:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 19:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 23:
                                    requiredString[charPointer] = (stringLen > (i + 25)) ? line.Substring(i - 1, 25) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 48:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 57:
                                    requiredString[charPointer] = (stringLen > (i + 6)) ? line.Substring(i - 1, 6) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 63:
                                    requiredString[charPointer] = (stringLen > (i + 7)) ? line.Substring(i - 1, 7) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 70:
                                    requiredString[charPointer] = (stringLen > (i + 8)) ? line.Substring(i - 1, 8) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 78:
                                    requiredString[charPointer] = (stringLen >= (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 83:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 84:
                                    requiredString[charPointer] = (stringLen > (i + 0)) ? line.Substring(i - 1, 0) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                default:
                                    i++;
                                    break;
                            }
                        }
                        break;
                    case 2: //Provider Batch Header Recorder Record- Type Identifier
                        while (i <= 600)
                        {
                            switch (i)
                            {
                                case 7: //Sequence number
                                    requiredString[charPointer] = line.Substring(charPointer, 7);
                                    charPointer++;
                                    i++;
                                    break;

                                case 8:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 9:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 14:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 19:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 23:
                                    requiredString[charPointer] = (stringLen > (i + 6)) ? line.Substring(i - 1, 6) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 29:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 34:
                                    requiredString[charPointer] = (stringLen > (i + 7)) ? line.Substring(i - 1, 7) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 41:
                                    requiredString[charPointer] = (stringLen > (i + 30)) ? line.Substring(i - 1, 30) : "";
                                    //Read Practice Name
                                    charPointer++;
                                    i++;
                                    break;

                                case 71:
                                    requiredString[charPointer] = (stringLen > (i + 6)) ? line.Substring(i - 1, 6) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 77:
                                    requiredString[charPointer] = (stringLen > (i + 6)) ? line.Substring(i - 1, 6) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 83:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 92:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 101:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 110:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 119:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 128:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 137:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 146:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 155:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 164:
                                    requiredString[charPointer] = (stringLen > (i + 8)) ? line.Substring(i - 1, 8) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 174:
                                    requiredString[charPointer] = (stringLen > (i + 6)) ? line.Substring(i - 1, 6) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 180:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 189:
                                    requiredString[charPointer] = (stringLen > (i + 404)) ? line.Substring(i - 1, 404) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                default:
                                    i++;
                                    break;
                            }
                        }
                        break;
                    case 5: //Claim Deatails Record- Record Type Identifier
                        while (i <= 600)
                        {
                            switch (i)
                            {
                                case 7: //Sequence number
                                    requiredString[charPointer] = line.Substring(charPointer, 7);
                                    charPointer++;
                                    i++;
                                    break;

                                case 8: //Record Identifier
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 9:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 14:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 19:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 23: //Transection Code
                                    requiredString[charPointer] = (stringLen > (i + 2)) ? line.Substring(i - 1, 2) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 25:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 34:
                                    requiredString[charPointer] = (stringLen > (i + 7)) ? line.Substring(i - 1, 7) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 41:
                                    requiredString[charPointer] = (stringLen > (i + 15)) ? line.Substring(i - 1, 15) : "";

                                    charPointer++;
                                    i++;
                                    break;

                                case 56:
                                    requiredString[charPointer] = (stringLen > (i + 20)) ? line.Substring(i - 1, 20) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 76:
                                    requiredString[charPointer] = (stringLen > (i + 15)) ? line.Substring(i - 1, 15) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 91:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 96:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 101: //Sequence number
                                    requiredString[charPointer] = (stringLen > (i + 6)) ? line.Substring(i - 1, 6) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 107:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 111:
                                    requiredString[charPointer] = (stringLen > (i + 12)) ? line.Substring(i - 1, 12) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 123:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 132:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 141:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 150:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 159:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 168:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 177:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 186:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 195:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 204:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 205:
                                    requiredString[charPointer] = (stringLen > (i + 15)) ? line.Substring(i - 1, 15) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 220:
                                    requiredString[charPointer] = (stringLen > (i + 6)) ? line.Substring(i - 1, 6) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 226:
                                    requiredString[charPointer] = (stringLen > (i + 7)) ? line.Substring(i - 1, 7) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 233:
                                    requiredString[charPointer] = (stringLen > (i + 20)) ? line.Substring(i - 1, 20) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 253:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 257:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 261:
                                    requiredString[charPointer] = (stringLen > (i + 6)) ? line.Substring(i - 1, 6) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 267:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 276:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 277:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 282:
                                    requiredString[charPointer] = (stringLen > (i + 2)) ? line.Substring(i - 1, 2) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 284:
                                    requiredString[charPointer] = (stringLen > (i + 8)) ? line.Substring(i - 1, 8) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 292:
                                    requiredString[charPointer] = (stringLen > (i + 3)) ? line.Substring(i - 1, 3) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 295:
                                    requiredString[charPointer] = (stringLen > (i + 8)) ? line.Substring(i - 1, 8) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 303:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 304:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 313:
                                    requiredString[charPointer] = (stringLen > (i + 34)) ? line.Substring(i - 1, 34) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 347:
                                    requiredString[charPointer] = (stringLen > (i + 20)) ? line.Substring(i - 1, 20) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 367:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 368:
                                    requiredString[charPointer] = (stringLen > (i + 20)) ? line.Substring(i - 1, 20) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 388:
                                    requiredString[charPointer] = (stringLen > (i + 20)) ? line.Substring(i - 1, 20) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 408:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 428:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 438:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 448:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 458:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 468:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 478:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 488:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 498:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 508:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 518:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 522:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 523:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 527:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 528:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 532:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 533:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 537:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 538:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 542:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 543:
                                    requiredString[charPointer] = (stringLen > (i + 67)) ? line.Substring(i - 1, 67) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                default:
                                    i++;
                                    break;
                            }
                        }
                        break;
                    case 7: //Product Item Detail Record- Record Type Identifier
                        while (i <= 600)
                        {
                            switch (i)
                            {
                                case 7: //Sequence number
                                    requiredString[charPointer] = line.Substring(charPointer, 7);
                                    charPointer++;
                                    i++;
                                    break;

                                case 8:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 9:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 14:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 19:
                                    requiredString[charPointer] = (stringLen > (i + 7)) ? line.Substring(i - 1, 7) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 26:
                                    requiredString[charPointer] = (stringLen > (i + 15)) ? line.Substring(i - 1, 15) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 41:
                                    requiredString[charPointer] = (stringLen > (i + 3)) ? line.Substring(i - 1, 3) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 44:
                                    requiredString[charPointer] = (stringLen > (i + 6)) ? line.Substring(i - 1, 7) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 51:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 61:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 66:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 67:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 76:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 85:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 94:
                                    requiredString[charPointer] = (stringLen > (i + 41)) ? line.Substring(i - 1, 41) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 135:
                                    requiredString[charPointer] = (stringLen > (i + 11)) ? line.Substring(i - 1, 11) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 146:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 155:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 164:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 173:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 182:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 191:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 200:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 209:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 218:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 227:
                                    requiredString[charPointer] = (stringLen > (i + 2)) ? line.Substring(i - 1, 2) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 229:
                                    requiredString[charPointer] = (stringLen > (i + 34)) ? line.Substring(i - 1, 34) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 263:
                                    requiredString[charPointer] = (stringLen > (i + 20)) ? line.Substring(i - 1, 20) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 283:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 292:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 293:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 303:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 313:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 323:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 333:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 343:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 353:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 363:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 373:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 383:
                                    requiredString[charPointer] = (stringLen > (i + 10)) ? line.Substring(i - 1, 10) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 393:
                                    requiredString[charPointer] = (stringLen > (i + 7)) ? line.Substring(i - 1, 7) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 400:
                                    requiredString[charPointer] = (stringLen > (i + 2)) ? line.Substring(i - 1, 2) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 402:
                                    requiredString[charPointer] = (stringLen > (i + 7)) ? line.Substring(i - 1, 7) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 409:
                                    requiredString[charPointer] = (stringLen > (i + 20)) ? line.Substring(i - 1, 20) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 429:
                                    requiredString[charPointer] = (stringLen > (i + 2)) ? line.Substring(i - 1, 2) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 431:
                                    requiredString[charPointer] = (stringLen > (i + 11)) ? line.Substring(i - 1, 11) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 442:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 446:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 447:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 451:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 452:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 456:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 457:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 461:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 462:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 466:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 467:
                                    requiredString[charPointer] = (stringLen > (i + 136)) ? line.Substring(i - 1, 136) : "";
                                    charPointer++;
                                    i++;
                                    break;


                                default:
                                    i++;
                                    break;
                            }
                        }
                        break;
                    case 8: //Additional Item Financial Information- Record Type Identifier
                        while (i <= 600)
                        {
                            switch (i)
                            {
                                case 7: //Sequence number
                                    requiredString[charPointer] = (stringLen > (charPointer + 7))
                                        ? line.Substring(charPointer + 7)
                                        : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 8: //Record Type Identifier
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 9: //Administrator Number
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 14: //Option Number
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 19: //Supplier BHF Number
                                    requiredString[charPointer] = (stringLen > (i + 7)) ? line.Substring(i - 1, 7) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 26: //Scheme Member Number
                                    requiredString[charPointer] = (stringLen > (i + 15)) ? line.Substring(i - 1, 15) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 41: //Claim Number/ Script Number
                                    requiredString[charPointer] = (stringLen > (i + 34)) ? line.Substring(i - 1, 34) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 75: //Item scheme surcharge type
                                    requiredString[charPointer] = (stringLen > (i + 2)) ? line.Substring(i - 1, 2) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 77: //Item scheme surcharge value
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 86: //Item scheme surcharge type
                                    requiredString[charPointer] = (stringLen > (i + 2)) ? line.Substring(i - 1, 2) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 88: //Item scheme surcharge value
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 97: //Item scheme surcharge type
                                    requiredString[charPointer] = (stringLen > (i + 2)) ? line.Substring(i - 1, 2) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 99: //Item scheme surcharge value
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 108: //Item scheme surcharge type
                                    requiredString[charPointer] = (stringLen > (i + 2)) ? line.Substring(i - 1, 2) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 110: //Item scheme surcharge value
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 119: //Item scheme surcharge type
                                    requiredString[charPointer] = (stringLen > (i + 2)) ? line.Substring(i - 1, 2) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 121: //Item scheme surcharge value
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 130: //Item scheme surcharge type
                                    requiredString[charPointer] = (stringLen > (i + 2)) ? line.Substring(i - 1, 2) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 132: //Item scheme surcharge value
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 141: //Item scheme surcharge type
                                    requiredString[charPointer] = (stringLen > (i + 2)) ? line.Substring(i - 1, 2) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 143: //Item scheme surcharge vale
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 152: //Filler
                                    requiredString[charPointer] = (stringLen > (i + 449)) ? line.Substring(i - 1, 449) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                default:
                                    i++;
                                    break;
                            }
                        }
                        break;
                    case 9: //Scheme Claim Total Record- Record Type Identifier
                        while (i <= 600)
                        {
                            switch (i)
                            {
                                case 7: //Sequence number
                                    requiredString[charPointer] = line.Substring(charPointer, 7);
                                    charPointer++;
                                    i++;
                                    break;

                                case 8:
                                    requiredString[charPointer] = (stringLen > (i + 1)) ? line.Substring(i - 1, 1) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 9:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 14:
                                    requiredString[charPointer] = (stringLen > (i + 5)) ? line.Substring(i - 1, 5) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 19:
                                    requiredString[charPointer] = (stringLen > (i + 4)) ? line.Substring(i - 1, 4) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 23:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 32:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 41:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 50:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 59:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 68:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 77:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 86:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 95:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 104:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 113:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 122:
                                    requiredString[charPointer] = (stringLen > (i + 6)) ? line.Substring(i - 1, 6) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 128:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 137:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 146:
                                    requiredString[charPointer] = (stringLen > (i + 9)) ? line.Substring(i - 1, 9) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                case 155:
                                    requiredString[charPointer] = (stringLen > (i + 456)) ? line.Substring(i - 1, 456) : "";
                                    charPointer++;
                                    i++;
                                    break;

                                default:
                                    i++;
                                    break;
                            }
                        }
                        break;
                }


                return requiredString;
            }
        }

        private class Other : IProcessFile
        {
            private readonly IHealthBridgeProcessorService _healthBridgeProcessorService;
            private readonly IMediSwitchProcessorService _mediSwitchProcessorService;
            private readonly ICommonProcessorService _commonProcessorService;
            private readonly ITebaProcessorService _tebaProcessorService;
            private readonly IInvoiceMedicalSwitchService _invoiceMedicalSwitchService;

            public Other(IHealthBridgeProcessorService healthBridgeProcessorService, IMediSwitchProcessorService mediSwitchProcessorService
                , ICommonProcessorService commonProcessorService, ITebaProcessorService tebaProcessorService, IInvoiceMedicalSwitchService invoiceMedicalSwitchService)
            {
                _healthBridgeProcessorService = healthBridgeProcessorService;
                _mediSwitchProcessorService = mediSwitchProcessorService;
                _commonProcessorService = commonProcessorService;
                _tebaProcessorService = tebaProcessorService;
                _invoiceMedicalSwitchService = invoiceMedicalSwitchService;
            }

            public async Task<int> ProcessFile(Switch switchDetail, string fileName, string content)
            {
                int switchBatchId = 0;
                switch (switchDetail.Name)
                {
                    case "MediSwitch":
                        switchBatchId = await _mediSwitchProcessorService.ProcessFile(switchDetail, fileName, content);
                        break;
                    case "HealthBridge":
                        switchBatchId = await _healthBridgeProcessorService.ProcessFile(switchDetail, fileName, content);
                        break;
                    case "Teba Finance":
                    case "Teba Claims":
                        switchBatchId = await _tebaProcessorService.ProcessFile(switchDetail, fileName, content);
                        break;
                    default:
                        switchBatchId = await _commonProcessorService.ProcessFile(switchDetail, fileName, content);
                        break;
                }

                return switchBatchId;
            }
        }
    }
}

Connect-AzureRmAccount
$location = "northeurope"
$resourceGroup = "securitydata"
$storageAccountName = "261325northeurope"
$storageAccount = get-AzStorageAccount -ResourceGroupName $resourceGroup -Name $storageAccountName
$ctx = $storageAccount.Context

# List all tables in storage account
Get-AzStorageTable -Context $ctx

# Count the WADMetrics tables
(Get-AzStorageTable -Context $ctx -Name "WADMetrics*").count

Get-AzStorageTable -Context $ctx -Name "WADMetrics*" | Remove-AzStorageTable -Force
Remove-AzStorageTable -Context $ctx -Name "WADWindowsEventLogsTable" -Force
Remove-AzStorageTable -Context $ctx -Name "WADPerformanceCountersTable" -Force



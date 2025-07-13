Connect-AzureRmAccount
$VMSS = Get-AzureRmVmss -ResourceGroupName "AZT-MCC-RG-01" -VMScaleSetName "AZT-MCC-FAB-01-primary"
Set-AzureRmVmssOSProfile -VirtualMachineScaleSet $VMSS -TimeZone "South Africa Standard Time"
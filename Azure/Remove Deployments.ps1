Connect-AzureRmAccount

$deployments = Get-AzResourceGroupDeployment -ResourceGroupName AZ-RG-01 | Where-Object Timestamp -lt ((Get-Date).AddDays(-5))

foreach ($deployment in $deployments) {
  Remove-AzResourceGroupDeployment -ResourceGroupName AZ-RG-01 -Name $deployment.DeploymentName
}
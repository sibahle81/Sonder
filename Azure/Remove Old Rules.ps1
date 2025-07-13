Connect-AzureRmAccount

$AppGw = Get-AzureRmApplicationGateway -Name "AZP-GEN-GWAY" -ResourceGroupName "AZ-RG-01"

#Rules
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httpredirect-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httpredirect-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httpredirect-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httpredirect-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "memberportal.randmutual.co.za-httpredirect-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "memberportal.randmutual.co.za-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httpredirect-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httpredirect-rule"

#Listeners
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httplistener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httpslistener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httplistener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httpslistener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httplistenr"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httpslistener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httplistener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httpslistener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "memberportal.randmutual.co.za-httplistener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "memberportal.randmutual.co.za-httpslistener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httplistener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httpslistener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httplistener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httpslistener"

#Probes
$AppGw = Remove-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-probe"
$AppGw = Remove-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-probe"
$AppGw = Remove-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-probe"
$AppGw = Remove-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-probe"
$AppGw = Remove-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "memberportal.randmutual.co.za-probe"
$AppGw = Remove-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-probe"
$AppGw = Remove-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-probe"

#HTTP Settings
$AppGw = Remove-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httpsettings"
$AppGw = Remove-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httpsettings"
$AppGw = Remove-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httpsettings"
$AppGw = Remove-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httpsettings"
$AppGw = Remove-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "memberportal.randmutual.co.za-httpsettings"
$AppGw = Remove-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httpsettings"
$AppGw = Remove-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httpsettings"

#Redirect Config
$AppGw = Remove-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httpsredirect"
$AppGw = Remove-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httpsredirect"
$AppGw = Remove-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httpsredirect"
$AppGw = Remove-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httpsredirect"
$AppGw = Remove-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httpsredirect"
$AppGw = Remove-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httpsredirect"
$AppGw = Remove-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "memberportal.randmutual.co.za-httpsredirect"
$AppGw = Remove-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httpsredirect"

Set-AzureRmApplicationGateway -ApplicationGateway $AppGw
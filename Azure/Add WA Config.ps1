Connect-AzureRmAccount

$AppGw = Get-AzureRmApplicationGateway -Name "AZP-GEN-GWAY" -ResourceGroupName "AZ-RG-01"
#get the front end IP configuraiton
$FrontEndIP = Get-AzureRmApplicationGatewayFrontendIPConfig -Name "appGatewayFrontendIP" -ApplicationGateway $AppGw
$FrontEndPort = Get-AzureRmApplicationGatewayFrontendPort -Name "appGatewayFrontendPort" -ApplicationGateway $AppGw
$httpsFrontEndPort = Get-AzureRmApplicationGatewayFrontendPort -Name "HTTPS" -ApplicationGateway $AppGw
$SSLCert01 = Get-AzureRmApplicationGatewaySslCertificate -Name "webcert" -ApplicationGateway $AppGW
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "wa-httpsettings"
$testBackendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azt-app-01" -ApplicationGateway $AppGw
$uatBackendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azu-app-01" -ApplicationGateway $AppGw


$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wadev.randmutual.co.za-httpslistener" -HostName "wadev.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wastest.randmutual.co.za-httpslistener" -HostName "wastest.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wauat.randmutual.co.za-httpslistener" -HostName "wauat.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wacate.randmutual.co.za-httpslistener" -HostName "wacate.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01

$devListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wadev.randmutual.co.za-httpslistener"
$stestListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wastest.randmutual.co.za-httpslistener"
$uatListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wauat.randmutual.co.za-httpslistener"
$cateListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wacate.randmutual.co.za-httpslistener"

$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "wadev.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $devListener -BackendAddressPool $testBackendPool
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "wastest.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $stestListener -BackendAddressPool $testBackendPool
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "wauat.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $uatListener -BackendAddressPool $uatBackendPool
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "wacate.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $cateListener -BackendAddressPool $uatBackendPool

Set-AzureRmApplicationGateway -ApplicationGateway $AppGw


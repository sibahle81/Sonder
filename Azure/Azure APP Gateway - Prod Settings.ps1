Connect-AzureRmAccount

$AppGw = Get-AzureRmApplicationGateway -Name "AZP-GEN-GWAY" -ResourceGroupName "AZ-RG-01"
#get the front end IP configuraiton
$FrontEndIP = Get-AzureRmApplicationGatewayFrontendIPConfig -Name "appGatewayFrontendIP" -ApplicationGateway $AppGw

#add the HTTP Listeners
$FrontEndPort = Get-AzureRmApplicationGatewayFrontendPort -Name "appGatewayFrontendPort" -ApplicationGateway $AppGw
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httplistener" -HostName "gateway.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort

#add the HTTPs Listeners
$httpsFrontEndPort = Get-AzureRmApplicationGatewayFrontendPort -Name "HTTPS" -ApplicationGateway $AppGw
$SSLCert01 = Get-AzureRmApplicationGatewaySslCertificate -Name "webcert" -ApplicationGateway $AppGW
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpslistener" -HostName "gateway.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01

#add the HTTPS Probes (only for https)
$devProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-probe" -Protocol Https -HostName "gateway.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3

Set-AzureRmApplicationGateway -ApplicationGateway $AppGw
#*********************************************************************************************
$AppGw = Get-AzureRmApplicationGateway -Name "AZP-GEN-GWAY" -ResourceGroupName "AZ-RG-01"

#add the HTTP Settings (only for https)
#Assuming that the auth certificate was already loaded get it
$rootCert = Get-AzureRmApplicationGatewayTrustedRootCertificate -ApplicationGateway $AppGw -Name "DigiCertGlobalRootCA"
$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpsettings" -Port 443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "gateway.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe

Set-AzureRmApplicationGateway -ApplicationGateway $AppGw
#*********************************************************************************************
$AppGw = Get-AzureRmApplicationGateway -Name "AZP-GEN-GWAY" -ResourceGroupName "AZ-RG-01"

#Create Redirect Rules for HTTP to HTTPS
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig

#Create rules for HTTPs
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azp-app-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool

Set-AzureRmApplicationGateway -ApplicationGateway $AppGw




#*********************************************************************************************
Connect-AzureRmAccount
$AppGw = Get-AzureRmApplicationGateway -Name "AZP-GEN-GWAY" -ResourceGroupName "AZ-RG-01"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-rule"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpredirect-rule"
$AppGw = Remove-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpsettings"
$AppGw = Remove-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-probe"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httplistener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpslistener"
Set-AzureRmApplicationGateway -ApplicationGateway $AppGw
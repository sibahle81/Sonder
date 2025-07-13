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

#add the HTTP Listeners
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wadev.randmutual.co.za-httplistener" -HostName "wadev.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wastest.randmutual.co.za-httplistener" -HostName "wastest.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wauat.randmutual.co.za-httplistener" -HostName "wauat.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wacate.randmutual.co.za-httplistener" -HostName "wacate.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort

#Create Redirect Rules for HTTP to HTTPS
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wadev.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wadev.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "wadev.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "wadev.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "wadev.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig

#Create Redirect Rules for HTTP to HTTPS
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wastest.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wastest.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "wastest.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "wastest.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "wastest.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig

#Create Redirect Rules for HTTP to HTTPS
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wauat.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wauat.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "wauat.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "wauat.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "wauat.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig

#Create Redirect Rules for HTTP to HTTPS
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wacate.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "wacate.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "wacate.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "wacate.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "wacate.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig


Set-AzureRmApplicationGateway -ApplicationGateway $AppGw

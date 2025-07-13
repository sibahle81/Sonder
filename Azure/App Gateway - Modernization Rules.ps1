Connect-AzureRmAccount

$AppGw = Get-AzureRmApplicationGateway -Name "AZP-WEB-GWAY-01" -ResourceGroupName "AZ-SECURITY-RG-01"
#get the front end IP configuraiton
$FrontEndIP = Get-AzureRmApplicationGatewayFrontendIPConfig -Name "appGwPublicFrontendIp" -ApplicationGateway $AppGw
$frontEndPort80 = Get-AzureRmApplicationGatewayFrontendPort -Name "port_80" -ApplicationGateway $AppGw
$frontEndPort443 = Get-AzureRmApplicationGatewayFrontendPort -Name "port_443" -ApplicationGateway $AppGw

$SSLCert01 = Get-AzureRmApplicationGatewaySslCertificate -Name "randmutual.co.za" -ApplicationGateway $AppGW

#add the HTTP Listeners
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httplistener" -HostName "sfdev.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $frontEndPort80
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httplistener" -HostName "sfstest.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $frontEndPort80
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httplistener" -HostName "sfuat.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $frontEndPort80
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httplistener" -HostName "sfcate.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $frontEndPort80
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfprod.randmutual.co.za-httplistener" -HostName "sfprod.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $frontEndPort80
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httplistener" -HostName "gateway.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $frontEndPort80

#add the HTTPs Listeners
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httpslistener" -HostName "sfdev.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $frontEndPort443 -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httpslistener" -HostName "sfstest.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $frontEndPort443 -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httpslistener" -HostName "sfuat.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $frontEndPort443 -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httpslistener" -HostName "sfcate.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $frontEndPort443 -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfprod.randmutual.co.za-httpslistener" -HostName "sfprod.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $frontEndPort443 -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpslistener" -HostName "gateway.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $frontEndPort443 -SslCertificate $SSLCert01

#Create HTTP Settings
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httpsettings" -Port 80 -Protocol "HTTP" -CookieBasedAffinity "Disabled" -HostName "sfdev.randmutual.co.za" 
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httpsettings" -Port 81 -Protocol "HTTP" -CookieBasedAffinity "Disabled" -HostName "sfstest.randmutual.co.za" 
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httpsettings" -Port 82 -Protocol "HTTP" -CookieBasedAffinity "Disabled" -HostName "sfuat.randmutual.co.za"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httpsettings" -Port 83 -Protocol "HTTP" -CookieBasedAffinity "Disabled" -HostName "sfcate.randmutual.co.za"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfprod.randmutual.co.za-httpsettings" -Port 80 -Protocol "HTTP" -CookieBasedAffinity "Disabled" -HostName "sfprod.randmutual.co.za"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpsettings" -Port 80 -Protocol "HTTP" -CookieBasedAffinity "Disabled" -HostName "gateway.randmutual.co.za"

Set-AzureRmApplicationGateway -ApplicationGateway $AppGw
$AppGw = Get-AzureRmApplicationGateway -Name "AZP-WEB-GWAY-01" -ResourceGroupName "AZ-SECURITY-RG-01"

#Create Redirect Rules for HTTP to HTTPS
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig
#stest
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig
#uat
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig
#cate
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig
#sfprod
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfprod.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfprod.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "sfprod.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "sfprod.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfprod.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig
#production
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig


#Create rules for HTTPs
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azu-mcc-fab-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#stest
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azu-mcc-fab-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#uat
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azu-mcc-fab-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#cate
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azu-mcc-fab-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#prod
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfprod.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azp-mcc-fab-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfprod.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfprod.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#prod
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azp-mcc-fab-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "gateway.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool


Set-AzureRmApplicationGateway -ApplicationGateway $AppGw

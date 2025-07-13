Connect-AzureRmAccount

$AppGw = Gtewet-AzureRmApplicationGaay -Name "AZP-GEN-GWAY" -ResourceGroupName "AZ-RG-01"
#get the front end IP configuraiton
$FrontEndIP = Get-AzureRmApplicationGatewayFrontendIPConfig -Name "appGatewayFrontendIP" -ApplicationGateway $AppGw

#add the HTTP Listeners
$FrontEndPort = Get-AzureRmApplicationGatewayFrontendPort -Name "appGatewayFrontendPort" -ApplicationGateway $AppGw
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httplistener" -HostName "mdev.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httplistener" -HostName "mstest.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muat.randmutual.co.za-httplistener" -HostName "muat.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za-httplistener" -HostName "mcate.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort

$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httplistener" -HostName "mdevmbr.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httplistener" -HostName "mstestmbr.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httplistener" -HostName "muatmbr.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httplistener" -HostName "mcatembr.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort

$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httplistener" -HostName "sfdev.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httplistener" -HostName "sfstest.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httplistener" -HostName "sfuat.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httplistener" -HostName "sfcate.randmutual.co.za" -Protocol "Http" -FrontendIpConfiguration $FrontEndIP -FrontendPort $FrontEndPort


#add the HTTPs Listeners
$httpsFrontEndPort = Get-AzureRmApplicationGatewayFrontendPort -Name "HTTPS" -ApplicationGateway $AppGw
$SSLCert01 = Get-AzureRmApplicationGatewaySslCertificate -Name "webcert" -ApplicationGateway $AppGW
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httpslistener" -HostName "mdev.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httpslistener" -HostName "mstest.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muat.randmutual.co.za-httpslistener" -HostName "muat.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za-httpslistener" -HostName "mcate.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01

$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httpslistener" -HostName "mdevmbr.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httpslistener" -HostName "mstestmbr.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httpslistener" -HostName "muatmbr.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httpslistener" -HostName "mcatembr.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01

$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httpslistener" -HostName "sfdev.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httpslistener" -HostName "sfstest.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httpslistener" -HostName "sfuat.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httpslistener" -HostName "sfcate.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01

#add the HTTPS Probes (only for https)
$devProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-probe" -Protocol Https -HostName "mdev.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3
$testProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-probe" -Protocol Https -HostName "mstest.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3
$uatProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "muat.randmutual.co.za-probe" -Protocol Https -HostName "muat.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3
$cateProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za-probe" -Protocol Https -HostName "mcate.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3

$devProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-probe" -Protocol Https -HostName "mdevmbr.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3
$testProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-probe" -Protocol Https -HostName "mstestmbr.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3
$uatProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-probe" -Protocol Https -HostName "muatmbr.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3
$cateProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-probe" -Protocol Https -HostName "mcatembr.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3

$devProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-probe" -Protocol Https -HostName "sfdev.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3
$testProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-probe" -Protocol Https -HostName "sfstest.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3
$uatProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-probe" -Protocol Https -HostName "sfuat.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3
$cateProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-probe" -Protocol Https -HostName "sfcate.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3

Set-AzureRmApplicationGateway -ApplicationGateway $AppGw

$AppGw = Get-AzureRmApplicationGateway -Name "AZP-GEN-GWAY" -ResourceGroupName "AZ-RG-01"

#add the HTTP Settings (only for https)
#Assuming that the auth certificate was already loaded get it
$rootCert = Get-AzureRmApplicationGatewayTrustedRootCertificate -ApplicationGateway $AppGw -Name "DigiCertGlobalRootCA"
$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httpsettings" -Port 443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "mdev.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe
$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httpsettings" -Port 443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "mstest.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe
$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "muat.randmutual.co.za-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "muat.randmutual.co.za-httpsettings" -Port 443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "muat.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe
$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za-httpsettings" -Port 443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "mcate.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe

$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httpsettings" -Port 443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "mdevmbr.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe
$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httpsettings" -Port 443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "mstestmbr.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe
$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httpsettings" -Port 443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "muatmbr.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe
$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httpsettings" -Port 443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "mcatembr.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe

$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httpsettings" -Port 443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "sfdev.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe
$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httpsettings" -Port 443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "sfstest.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe
$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httpsettings" -Port 443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "sfuat.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe
$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httpsettings" -Port 443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "sfcate.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe

Set-AzureRmApplicationGateway -ApplicationGateway $AppGw
$AppGw = Get-AzureRmApplicationGateway -Name "AZP-GEN-GWAY" -ResourceGroupName "AZ-RG-01"

#Create Redirect Rules for HTTP to HTTPS
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig
#stest
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig
#uat
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muat.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muat.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "muat.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "muat.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "muat.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig
#cate
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig

#MEMBER
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig
#stest
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig
#uat
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig
#cate
$httpListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httplistener"
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httpsredirect" -RedirectType Permanent -TargetListener $httpsListener -IncludePath 1 -IncludeQueryString 1
$redirectConfig = Get-AzureRmApplicationGatewayRedirectConfiguration -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httpsredirect"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httpredirect-rule" -RuleType Basic -HttpListener $httpListener -RedirectConfiguration $redirectConfig

#Service Fabric
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


#Create rules for HTTPs
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azt-app-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#stest
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azt-app-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#uat
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "muat.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azu-app-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muat.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "muat.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#cate
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azu-app-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool

#Member
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azt-app-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mdevmbr.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#stest
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azt-app-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mstestmbr.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#uat
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azu-app-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "muatmbr.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#cate
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azu-app-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "mcatembr.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool


#Service Fabric
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azt-fab-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfdev.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#stest
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azt-fab-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfstest.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#uat
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azt-fab-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfuat.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool
#cate
$backendSettings = Get-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httpsettings"
$backendPool = Get-AzureRmApplicationGatewayBackendAddressPool -Name "azt-fab-01" -ApplicationGateway $AppGw
$httpsListener = Get-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-httpslistener"
$Appgw = Add-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "sfcate.randmutual.co.za-rule" -RuleType Basic -BackendHttpSettings $backendSettings -HttpListener $httpsListener -BackendAddressPool $backendPool


Set-AzureRmApplicationGateway -ApplicationGateway $AppGw


#************************************************************************************************************************************************************************************************************

$AppGw = Get-AzureRmApplicationGateway -Name "AZP-GEN-GWAY" -ResourceGroupName "AZ-RG-01"
#Create the internal listeners for Dev and test
$FrontEndIP = Get-AzureRmApplicationGatewayFrontendIPConfig -Name "appgatewayinternalip" -ApplicationGateway $AppGw

#add the HTTP Listeners
$httpsFrontEndPort = Get-AzureRmApplicationGatewayFrontendPort -Name "HTTPS_Internal" -ApplicationGateway $AppGw
$SSLCert01 = Get-AzureRmApplicationGatewaySslCertificate -Name "webcert" -ApplicationGateway $AppGW
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-internal-httpslistener" -HostName "mdev.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
$Appgw = Add-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za-internal-httpslistener" -HostName "mstest.randmutual.co.za" -Protocol "Https" -FrontendIpConfiguration $FrontEndIP -FrontendPort $httpsFrontEndPort -SslCertificate $SSLCert01
Set-AzureRmApplicationGateway -ApplicationGateway $AppGw

# create the Http settings for port 8443
$AppGw = Get-AzureRmApplicationGateway -Name "AZP-GEN-GWAY" -ResourceGroupName "AZ-RG-01"
$rootCert = Get-AzureRmApplicationGatewayTrustedRootCertificate -ApplicationGateway $AppGw -Name "DigiCertGlobalRootCA"
$devProbe = Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-internal-probe" -Protocol Https -HostName "mdev.randmutual.co.za" -Path "/" -Interval 30 -Timeout 30 -UnhealthyThreshold 3

$probe = Get-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-internal-probe"
$AppGw = Add-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za-internal-httpsettings" -Port 8443 -Protocol "HTTPS" -CookieBasedAffinity "Disabled" -HostName "mdev.randmutual.co.za" -TrustedRootCertificate $rootCert -Probe $probe
Set-AzureRmApplicationGateway -ApplicationGateway $AppGw
______________


$AppGw = Remove-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mtest.randmutual.co.zaProbe"
$AppGw = Remove-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mtest.randmutual.co.zaHttpSettings"

$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "MDEV-APPGW-RULE"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "MSTEST-APPGW-RULE"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "MUAT-APPGW-RULE"
$AppGw = Remove-AzureRmApplicationGatewayRequestRoutingRule -ApplicationGateway $AppGw -Name "MCATE-APPGW-RULE"

$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstest.randmutual.co.za"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muat.randmutual.co.za"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcate.randmutual.co.za"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mstest.randmutual.co.zaHttpListener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "muat.randmutual.co.zaHttpListener"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mcate.randmutual.co.zaHttpListener"

$AppGw = Remove-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "muat.randmutual.co.zaHttpSettings"
$AppGw = Remove-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mcate.randmutual.co.zaHttpSettings"
$AppGw = Remove-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mstest.randmutual.co.zaHttpSettings"

$AppGw = Remove-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "muat.randmutual.co.zaProbe"
$AppGw = Remove-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mcate.randmutual.co.zaProbe"
$AppGw = Remove-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mstest.randmutual.co.zaProbe"

mdev.randmutual.co.zaHttpsRedirect
$AppGw = Get-AzureRmApplicationGateway -Name "AZP-GEN-GWAY" -ResourceGroupName "AZ-RG-01"
$AppGw = Remove-AzureRmApplicationGatewayHttpListener -ApplicationGateway $AppGw -Name "mdev.randmutual.co.za"
$AppGw = Remove-AzureRmApplicationGatewayBackendHttpSettings -ApplicationGateway $AppGw -Name "mdev.randmutual.co.zaHttpSettings"
$AppGw = Remove-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $AppGw -Name "mdev.randmutual.co.zaProbe"
Set-AzureRmApplicationGateway -ApplicationGateway $AppGw

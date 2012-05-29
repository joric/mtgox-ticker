set dir=%~dp0
call d:\lib\addon-sdk-1.7\bin\activate.bat
cd %dir%
cfx xpi
::add the following for autoupdate:
::--update-link https://ecdsa.com/electrum/latest --update-url https://ecdsa.org/electrum/update_rdf

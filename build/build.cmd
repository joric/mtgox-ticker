::see https://addons.mozilla.org/en-US/developers/builder
::edit minVersion in addon-sdk-1.7/python-lib/cuddlefish/app-extension/install.rdf

set dir=%~dp0
call d:\lib\addon-sdk-1.7\bin\activate.bat
cd %dir%
cfx.bat xpi

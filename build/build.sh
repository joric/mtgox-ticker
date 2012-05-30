# see https://addons.mozilla.org/en-US/developers/builder
# edit minVersion in addon-sdk-1.7/python-lib/cuddlefish/app-extension/install.rdf

DIR=`pwd`
cd ~/Downloads/addon-sdk-1.7
source bin/activate
cd $DIR
cfx xpi

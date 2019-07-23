
set -e
set -x

# install plugins in config.xml and bootstrap platforms
cordova prepare

# install aerogear plugins
cordova plugin add --nosave \
    @aerogear/cordova-plugin-aerogear-metrics@dev \
    @aerogear/cordova-plugin-aerogear-push@dev \
    @aerogear/cordova-plugin-aerogear-security@dev \
    @aerogear/cordova-plugin-iroot@latest

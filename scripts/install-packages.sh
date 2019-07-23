
set -e
set -x

# update supported packages to master version
npm install --no-save \
    @aerogear/app@dev \
    @aerogear/auth@dev \
    @aerogear/push@dev \
    @aerogear/security@dev \
    @aerogear/voyager-client@dev \
    @aerogear/voyager-server@latest

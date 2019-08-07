FROM circleci/android:api-28-node

USER root

RUN apt update \
    && apt install gradle

RUN npm -g install cordova

RUN useradd -m -u 1001 jenkins

ENV HOME=/home/jenkins
USER jenkins

FROM circleci/android:api-28-node

USER root

RUN apt update \
    && apt install gradle

ADD https://password.corp.redhat.com/RH-IT-Root-CA.crt $HOME/RH-IT-Root-CA.crt

RUN npm config set cafile ~/RH-IT-Root-CA.crt

RUN npm config set registry https://repository.engineering.redhat.com/nexus/repository/registry.npmjs.org

RUN npm -g install cordova

RUN useradd -m -u 1001 jenkins

ENV HOME=/home/jenkins
USER jenkins

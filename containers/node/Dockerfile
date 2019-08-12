FROM circleci/node:dubnium-stretch

USER root

RUN useradd -m -u 1001 jenkins \
    && echo "jenkins ALL=NOPASSWD: ALL" > /etc/sudoers.d/60-jenkins

USER jenkins

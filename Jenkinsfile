def runIntegrationTests() {
  sh "JUNIT_REPORT_PATH=report-${env.MOBILE_PLATFORM}.xml npm start -- --reporter mocha-jenkins-reporter test/**/*.js || true"
  archiveArtifacts "report-${env.MOBILE_PLATFORM}.xml"
  junit allowEmptyResults: true, testResults: "report-${env.MOBILE_PLATFORM}.xml"
}

pipeline {
  agent none
  environment {
    BROWSERSTACK_USER = credentials('browserstack-user')
    BROWSERSTACK_KEY = credentials('browserstack-key')
    FIREBASE_SERVER_KEY = credentials('firebase-server-key')
    FIREBASE_SENDER_ID = credentials('firebase-sender-id')
    FASTLANE_USER = credentials('fastlane-user')
    FASTLANE_PASSWORD = credentials('fastlane-password')
    MATCH_PASSWORD = credentials('match-password')
    KEYCHAIN_PASS = credentials('mac2-password')
    JUNIT_REPORT_STACK="1"
  }
  stages {
    stage('Build Testing App') {
      parallel {

        stage('Android') {
          agent {
            dockerfile {
              dir 'containers/android/'
              filename 'Dockerfile'
              label 'psi_rhel8'
            }
          }
          environment {
            GOOGLE_SERVICES = credentials('google-services')
          }
          steps {
            sh """
            cp ${GOOGLE_SERVICES} ./fixtures/google-services.json
            ./scripts/build-testing-app.sh
            """
            stash includes: 'testing-app/bs-app-url.txt', name: 'android-testing-app'
            stash includes: 'testing-app/package-lock.json', name: 'package-lock'
          }
        }

        stage('iOS') {
          agent { 
            label 'osx5x'
          }
          environment { 
            MOBILE_PLATFORM = 'ios'
          }
          steps {
            sh """#!/usr/bin/env bash -l
            npm -g install cordova
            security unlock-keychain -p $KEYCHAIN_PASS && ./scripts/build-testing-app.sh
            """
            stash includes: 'testing-app/bs-app-url.txt', name: 'ios-testing-app'
          }
        }
      }
    }

    stage('Testing') {
      agent {
        dockerfile {
          dir 'containers/node/'
          filename 'Dockerfile'
          label 'psi_rhel8'
          args '--volume /var/run/docker.sock:/var/run/docker.sock --network host'
        }
      }
      stages {
        stage('Start services') {
          steps {
            sh 'sudo docker-compose up -d'
          }
        }
        stage('Install dependencies for tests') {
            steps {
              sh """
              npm install
              npm install mocha-jenkins-reporter
              """
              unstash 'package-lock'
            }
        }
        stage('Test android') {
          environment { 
            MOBILE_PLATFORM = 'android'
          }
          steps {
            unstash 'android-testing-app'
            runIntegrationTests()
          }
        }
        stage('Test ios') {
          environment { 
            MOBILE_PLATFORM = 'ios'
          }
          steps {
            unstash 'ios-testing-app'
            runIntegrationTests()
          }
        }
      }
      post { 
        always {
          sh """
          sudo docker-compose logs --no-color > docker-compose.log
          sudo docker-compose down
          """
          archiveArtifacts 'docker-compose.log'
        }
      }
    }
  }
}
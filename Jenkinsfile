def runIntegrationTests() {
    withDockerContainer(image: 'circleci/node:dubnium-stretch', args: '-u root --network aerogear') {
        sh "JUNIT_REPORT_PATH=report-${env.MOBILE_PLATFORM}.xml npm start -- --reporter mocha-jenkins-reporter test/**/*.js || true"
        archiveArtifacts "report-${env.MOBILE_PLATFORM}.xml"
        junit allowEmptyResults: true, testResults: "report-${env.MOBILE_PLATFORM}.xml"
    }
}

pipeline {
  agent {
    label 'psi_rhel8'
  }
  environment {
    BROWSERSTACK_USER = credentials('browserstack-user')
    BROWSERSTACK_KEY = credentials('browserstack-key')
    FIREBASE_SERVER_KEY = credentials('firebase-server-key')
    FIREBASE_SENDER_ID = credentials('firebase-sender-id')
    FASTLANE_USER = credentials('fastlane-user')
    FASTLANE_PASSWORD = credentials('fastlane-password')
    MATCH_PASSWORD = credentials('match-password')
    KEYCHAIN_PASS = credentials('mac2-password')
    CI = "true"
    JUNIT_REPORT_STACK="1"
  }
  stages {
    stage('Build Testing App') {
      parallel {

        stage('Android') {
          environment {
            GOOGLE_SERVICES = credentials('google-services')
          }
          steps {
            git branch: 'master', url: 'https://github.com/aerogear/aerogear-integration-tests.git'
            withDockerContainer(image: 'circleci/android:api-28-node', args: '-u root') {
              sh """
              apt update
              apt install gradle
              npm -g install cordova
              cp ${GOOGLE_SERVICES} ./fixtures/google-services.json
              ./scripts/build-testing-app.sh
              """
              stash includes: 'testing-app/bs-app-url.txt', name: 'android-testing-app'
            }
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
            git branch: 'master', url: 'https://github.com/aerogear/aerogear-integration-tests.git'
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
      stages {
        stage('Start services') {
          steps {
              sh """
              docker network create aerogear || true
              docker-compose up -d
              # To remove ownership of root user from testing-app folder
              sudo chown -R jenkins:jenkins .
              """
          }
        }
        stage('Install dependencies for tests') {
            steps {
                withDockerContainer(image: 'circleci/node:dubnium-stretch', args: '-u root') {
                  sh """
                  npm install
                  npm install mocha-jenkins-reporter
                  """
                }
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
          docker-compose logs --no-color > docker-compose.log
          docker-compose down
          docker network rm aerogear || true
          """
          archiveArtifacts 'docker-compose.log'
        }
      }
    }
  }
}
def runIntegrationTests() {
    withDockerContainer(image: 'circleci/node:dubnium-stretch', args: '-u root --network aerogear') {
        sh "JUNIT_REPORT_PATH=report-${env.MOBILE_PLATFORM}.xml npm start -- --reporter mocha-jenkins-reporter test/**/*.js || true"
        archiveArtifacts "report-${env.MOBILE_PLATFORM}.xml"
        junit allowEmptyResults: true, testResults: "report-${env.MOBILE_PLATFORM}.xml"
    }
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
    CI = "true"
    JUNIT_REPORT_STACK="1"
  }
  stages {
    // stage('Build Testing App') {
    //   parallel {

    //     stage('Android') {
    //       agent {
    //         docker {
    //           image 'circleci/android:api-28-node'
    //           label 'psi_rhel8'
    //           args '-u root'
    //         }
    //       }
    //       environment {
    //         GOOGLE_SERVICES = credentials('google-services')
    //       }
    //       steps {
    //         sh 'apt update'
    //         sh 'apt install gradle'
    //         sh 'npm -g install cordova@8'
    //         sh 'cp ${GOOGLE_SERVICES} ./google-services.json'
    //         sh 'npm install --unsafe-perm'
    //         sh 'npm run prepare:android'
    //         sh 'npm run build:android'
    //         sh './scripts/upload-app-to-browserstack.sh android > BROWSERSTACK_APP'
    //         stash includes: 'BROWSERSTACK_APP', name: 'android-browserstack-app'
    //       }
    //     }

    //     stage('iOS') {
    //       agent { 
    //         label 'osx5x'
    //       }
    //       environment { 
    //         MOBILE_PLATFORM = 'ios'
    //       }
    //       steps {
    //         sh 'npm -g install cordova@8'
    //         sh 'npm install'
    //         sh 'npm run prepare:ios'
    //         sh """#!/usr/bin/env bash -l
    //         security unlock-keychain -p $KEYCHAIN_PASS && npm run build:ios
    //         """
    //         sh './scripts/upload-app-to-browserstack.sh ios > BROWSERSTACK_APP'
    //         stash includes: 'BROWSERSTACK_APP', name: 'ios-browserstack-app'        
    //       }
    //     }
    //   }
    // }

    stage('Testing') {
      stages {
        stage('Start services') {
          agent {
            docker {
              image 'circleci/node:dubnium-stretch'
              label 'psi_rhel8'
              args '-u root -v /var/run/docker.sock:/var/run/docker.sock'
            }
          }
          steps {
            sh 'docker ps'
              sh """
              docker network create aerogear || true
              docker-compose up -d
              # To remove ownership of root user from testing-app folder
              sudo chown -R jenkins:jenkins .
              """
          }
        }
        // stage('Install dependencies for tests') {
        //     steps {
        //         withDockerContainer(image: 'circleci/node:dubnium-stretch', args: '-u root') {
        //           sh """
        //           npm install
        //           npm install mocha-jenkins-reporter
        //           """
        //         }
        //     }
        // }
        // stage('Test android') {
        //   environment { 
        //     MOBILE_PLATFORM = 'android'
        //   }
        //   steps {
        //     unstash 'android-testing-app'
        //     runIntegrationTests()
        //   }
        // }
        // stage('Test ios') {
        //   environment { 
        //     MOBILE_PLATFORM = 'ios'
        //   }
        //   steps {
        //     unstash 'ios-testing-app'
        //     runIntegrationTests()
        //   }
        // }
      }
    //   post { 
    //     always {
    //       sh ''
    //       sh """
    //       docker-compose logs --no-color > docker-compose.log
    //       docker-compose down
    //       docker network rm aerogear || true
    //       """
    //       archiveArtifacts 'docker-compose.log'
    //     }
    //   }
    // }
    }
  }
}
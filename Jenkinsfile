def runIntegrationTests(platform) {
  unstash "${platform}-browserstack-app"
  sh """
  JUNIT_REPORT_PATH=report-${platform}.xml \
  MOBILE_PLATFORM=${platform} \
  BROWSERSTACK_APP="\$(cat BROWSERSTACK_APP)" \
    npm test || true
  """
  archiveArtifacts "report-${platform}.xml"
  junit allowEmptyResults: true, testResults: "report-${platform}.xml"
}

// we need to clean the worskpace after each stage 
// because we are using containers running with the root
// user instant of the jenkins user
def cleanWorkSpace() {
  sh 'find . -mindepth 1 -delete'
}

pipeline {
  agent none
  options {
    // allow to restart a build from a specific stage by reusing
    // stashed files from previous builds
    preserveStashes(buildCount: 5)
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
          agent {
            docker {
              image 'circleci/android:api-28-node'
              label 'psi_rhel8'
              args '-u root'
            }
          }
          environment {
            GOOGLE_SERVICES = credentials('google-services')
          }
          steps {
            sh 'apt update'
            sh 'apt install gradle'
            sh 'npm -g install cordova'
            sh 'cp ${GOOGLE_SERVICES} ./google-services.json'
            // unsafe perm is required because we are root
            sh 'npm install --unsafe-perm'
            sh 'npm run prepare:android'
            sh 'npm run build:android'
            sh './scripts/upload-app-to-browserstack.sh android > BROWSERSTACK_APP'
            stash includes: 'BROWSERSTACK_APP', name: 'android-browserstack-app'
          }
          post {
            always {
              cleanWorkSpace()
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
            sh 'npm -g install cordova'
            sh 'npm install'
            sh 'npm run prepare:ios'
            // bash -l is required in order to make fastlane available in the PATH
            sh """#!/usr/bin/env bash -l
            security unlock-keychain -p $KEYCHAIN_PASS && npm run build:ios
            """
            sh './scripts/upload-app-to-browserstack.sh ios > BROWSERSTACK_APP'
            stash includes: 'BROWSERSTACK_APP', name: 'ios-browserstack-app'        
          }
          post { 
            always {
              cleanWorkSpace()
            }
          }
        }
      }
    }

    stage('Testing') {
      agent {
        docker {
          image 'circleci/node:dubnium-stretch'
          label 'psi_rhel8'
          args '-u root -p 4000:4000 -v /var/run/docker.sock:/var/run/docker.sock'
        }
      }
      environment {
        // default ip to the docker host where also docker-compose will be executed
        SERVICES_HOST= "172.17.0.1"
        // the sync service is running in the same container
        // SYNC_HOST="bs-local.com"
      }
      stages {
        stage('Prepare') {
            steps {
              sh 'docker-compose up -d'
              sh 'npm install --unsafe-perm'
              unstash 'android-browserstack-app'
              unstash 'ios-browserstack-app'
            }
        }
        stage('Test android') {
          steps {
            runIntegrationTests('android')
          }
        }
        stage('Test ios') {
          steps {
            runIntegrationTests('ios')
          }
        }
      }
      post { 
        always {
          sh 'docker-compose logs --no-color > docker-compose.log'
          sh 'docker-compose down'
          archiveArtifacts 'docker-compose.log'
          cleanWorkSpace()
        }
      }
    }
  }
}
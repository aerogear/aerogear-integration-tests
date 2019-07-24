
def runTests() {
  sh 'CI=true JUNIT_REPORT_PATH=report-$MOBILE_PLATFORM.xml JUNIT_REPORT_STACK=1 npm start -- --reporter mocha-jenkins-reporter test/**/*.js || true'
  archiveArtifacts "report-${env.MOBILE_PLATFORM}.xml"
  junit allowEmptyResults: true, testResults: "report-${env.MOBILE_PLATFORM}.xml"
}

node('psi_rhel8') {
  cleanWs()
  linuxNodeIP = sh(returnStdout: true, script: 'echo $OPENSTACK_PUBLIC_IP').trim()
  try {
    sh 'docker network create aerogear'

    withCredentials([
      usernamePassword(
        credentialsId: 'browserstack',
        usernameVariable: 'BROWSERSTACK_USER',
        passwordVariable: 'BROWSERSTACK_KEY'
      ),
      string(credentialsId: 'firebase-server-key', variable: 'FIREBASE_SERVER_KEY'),
      string(credentialsId: 'firebase-sender-id', variable: 'FIREBASE_SENDER_ID'),
    ]) {
      stage('Build testing app') {
        parallel Android: {
          docker.image('circleci/android:api-28-node').inside('-u root:root --network aerogear') {
            dir('aerogear-integration-tests') {
              sh 'apt install gradle'
              sh 'npm -g install cordova@8'
              checkout scm
              withCredentials([file(credentialsId: 'google-services', variable: 'GOOGLE_SERVICES')]) {
                sh 'cp ${GOOGLE_SERVICES} ./fixtures/google-services.json'
                sh './scripts/build-testing-app.sh'
              }
              androidAppUrl = sh(returnStdout: true, script: 'cat "./testing-app/bs-app-url.txt" | cut -d \'"\' -f 4').trim()
            }
          }
        },
        iOS: {
          node('osx5x') {
            cleanWs()
            withEnv([
              'MOBILE_PLATFORM=ios',
              'DEVELOPMENT_TEAM=GHPBX39444',
              'KEYCHAIN_PASS=5sdfDSO8ig'
            ]) {
              dir('aerogear-integration-tests-osx') {
                originalRegistry = sh(script: 'npm get registry', returnStdout: true).trim()
                try {
                  sh "npm set registry http://${linuxNodeIP}:4873/"
                  sh 'npm -g install cordova@8'
                  checkout scm
                  sh 'security unlock-keychain -p $KEYCHAIN_PASS && ./scripts/build-testing-app.sh'
                  iosAppUrl = sh(returnStdout: true, script: 'cat "./testing-app/bs-app-url.txt" | cut -d \'"\' -f 4').trim()
                } catch (e) {
                  throw e
                } finally {
                  sh "npm set registry ${originalRegistry}"
                }
              }
            }
          }
        }
      }
      dir('aerogear-integration-tests') {
        try {
          stage('Start services') {
            sh 'sudo curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose'
            sh 'sudo chmod +x /usr/local/bin/docker-compose'
            sh 'docker-compose up -d'
          }
          docker.image('circleci/node:dubnium-stretch').inside('-u root:root --network aerogear') {
            stage('Test Android') {
              sh 'npm install'
              sh 'npm install mocha-jenkins-reporter'
              withEnv([
                'MOBILE_PLATFORM=android',
                'BROWSERSTACK_APP=' + androidAppUrl
              ]) {
                runTests()
              }
            }
            stage('Test iOS') {
              withEnv([
                'MOBILE_PLATFORM=ios',
                'BROWSERSTACK_APP=' + iosAppUrl
              ]) {    
                runTests()
              }
            }
          }
        } catch (e) {
          throw e
        } finally {
          sh 'docker-compose logs --no-color > docker-compose.log'
          sh 'docker-compose down'
          archiveArtifacts "docker-compose.log"
        }
      }
    }
  } catch (e) {
    throw e
  } finally {
    sh 'docker rmi aerogear/aerogear-app-metrics:latest || true'
    sh 'docker network rm aerogear || true'
  }
}
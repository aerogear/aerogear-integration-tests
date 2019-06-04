def releaseJS() {
  sh 'npm set registry http://verdaccio:4873/'
  sh 'npx npm-cli-login -u test -p test -e test@example.com -r http://verdaccio:4873'
  sh 'git config --global user.email "test@example.com"'
  sh 'git config --global user.name "test"'
  sh 'npx lerna version patch --no-push --yes'
  sh 'CI=true npm run release:prep'
  sh 'TAG=\$(node -e "console.log(require(\'./lerna.json\').version);") npm run release:validate'
  sh 'TAG=\$(node -e "console.log(require(\'./lerna.json\').version);") CI=true npm run publish'
}

def runTests() {
  sh 'CI=true JUNIT_REPORT_PATH=report-$MOBILE_PLATFORM.xml JUNIT_REPORT_STACK=1 npm start -- --reporter mocha-jenkins-reporter test/**/*.js || true'
  archiveArtifacts "report-${env.MOBILE_PLATFORM}.xml"
  junit allowEmptyResults: true, testResults: "report-${env.MOBILE_PLATFORM}.xml"
}

node('psi_rhel8') {
  cleanWs()
  linuxNodeIP = sh(returnStdout: true, script: 'echo $OPENSTACK_PUBLIC_IP').trim()
  buildAerogear = buildAerogear.toString() == 'true'

  try {
    sh 'docker network create aerogear'

    // npm proxy registry - used for js publishing testing
    docker.image('verdaccio/verdaccio').withRun('--network aerogear --name verdaccio -p 4873:4873') {
      withCredentials([
        usernamePassword(
          credentialsId: 'browserstack',
          usernameVariable: 'BROWSERSTACK_USER',
          passwordVariable: 'BROWSERSTACK_KEY'
        )
      ]) {
        stage('Build js-sdk') {
          if (buildAerogear) {
            docker.image('circleci/node:dubnium-stretch').inside('-u root:root --network aerogear') {
              dir('aerogear-js-sdk') {
                git branch: 'master', url: 'https://github.com/aerogear/aerogear-js-sdk.git'
                releaseJS()
              }
            }
          } else {
            echo 'Skipping the build'
          }
        }
        stage('Build app-metrics') {
          if (buildAerogear) {
            dir('aerogear-app-metrics') {
              docker.image('circleci/golang:stretch').inside('-u root:root') {
                git branch: 'master', url: 'https://github.com/aerogear/aerogear-app-metrics.git'
                sh 'mkdir -p /go/src/github.com/aerogear'
                sh 'ln -s \$(pwd) /go/src/github.com/aerogear'
                sh 'cd /go/src/github.com/aerogear/aerogear-app-metrics && make build_linux'
              }
              sh 'docker build -t aerogear/aerogear-app-metrics:latest --build-arg BINARY=./dist/linux_amd64/aerogear-app-metrics .'
            }
          } else {
            echo 'Skipping the build'
          }
        }
        stage('Build voyager-server') {
          if (buildAerogear.toString() == 'true') {
            docker.image('circleci/node:dubnium-stretch').inside('-u root:root --network aerogear') {
              dir('voyager-server') {
                git branch: 'master', url: 'https://github.com/aerogear/voyager-server.git'
                releaseJS()
              }
            }
          } else {
              echo 'Skipping the build'
          }
        }
        stage('Build testing app') {
          parallel Android: {
            docker.image('circleci/android:api-28-node').inside('-u root:root --network aerogear') {
              dir('aerogear-integration-tests') {
                sh 'npm set registry http://verdaccio:4873/'
                sh 'apt install gradle'
                sh 'npm -g install cordova@8'
                git branch: 'master', url: 'https://github.com/jhellar/aerogear-integration-tests.git'
                sh './scripts/build-testing-app.sh'
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
                    git branch: 'master', url: 'https://github.com/jhellar/aerogear-integration-tests.git'
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
            sh 'sudo curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose'
            sh 'sudo chmod +x /usr/local/bin/docker-compose'
            sh 'docker-compose up -d'
            docker.image('circleci/node:dubnium-stretch').inside('-u root:root --network aerogear') {
              stage('Test Android') {
                sh 'npm set registry http://verdaccio:4873/'
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
            sh 'docker-compose down'
          }
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
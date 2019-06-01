curl \
  -u "$BROWSERSTACK_USER:$BROWSERSTACK_KEY" \
  -X POST https://api-cloud.browserstack.com/app-automate/upload \
  -F "file=@$(pwd)/testing-app/platforms/android/app/build/outputs/apk/debug/app-debug.apk"

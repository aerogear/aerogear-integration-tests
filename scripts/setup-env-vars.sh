export KEYCLOAK_HOST=$([ "$CI" == "true" ] && echo "keycloak" || echo "bs-local.com")
export KEYCLOAK_PORT=8080
export SYNC_HOST=bs-local.com
export SYNC_PORT=4000
export METRICS_HOST=bs-local.com
export METRICS_PORT=3000
export PGHOST=$([ "$CI" == "true" ] && echo "postgres" || echo "localhost")
export PGUSER=postgresql
export PGPASSWORD=postgres
export PGDATABASE=aerogear_mobile_metrics
export BROWSERSTACK_APP=$(cat "./testing-app/bs-app-url.txt" | cut -d '"' -f 4)

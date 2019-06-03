if [ "$CI" = "true" ]; then
  export KEYCLOAK_HOST=keycloak
  export METRICS_HOST=metrics
  export PGHOST=postgres
else
  export KEYCLOAK_HOST=bs-local.com
  export METRICS_HOST=bs-local.com
  export PGHOST=localhost
fi

export KEYCLOAK_PORT=8080
export METRICS_PORT=3000

export PGUSER=postgresql
export PGPASSWORD=postgres
export PGDATABASE=aerogear_mobile_metrics

export SYNC_HOST=bs-local.com
export SYNC_PORT=4000

if [ -z "$BROWSERSTACK_APP" ]; then
  export BROWSERSTACK_APP=$(cat "./testing-app/bs-app-url.txt" | cut -d '"' -f 4)
fi

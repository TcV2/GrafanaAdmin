#!/bin/bash
yarn build
rm -rf /d/Setups/AppData/GrafanaLabs/grafana/data/plugins/koha-Button
mv dist/ /d/Setups/AppData/GrafanaLabs/grafana/data/plugins/koha-Button
cp -r src/css /d/Setups/AppData/GrafanaLabs/grafana/data/plugins/koha-Button
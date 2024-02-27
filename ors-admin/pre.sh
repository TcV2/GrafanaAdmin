#!/bin/bash
yarn build
sudo rm -r /var/lib/grafana/plugins/koha-Button
mv dist/ /var/lib/grafana/plugins/koha-Button
cp -r src/css /var/lib/grafana/plugins/koha-Button
systemctl restart grafana-server
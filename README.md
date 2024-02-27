# GrafanaAdmin

```
Unbuntu 22.04.3 LTS
```
# Proxy
  1. Install Nodejs

  $ curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  $ sudo apt-get install -y nodejs
  
  $ sudo npm install express
  $ sudo npm install http-proxy-middleware
  - Chạy thử file proxy.js, thiếu gì thì cài thêm bằng lệnh ( $ npm install ...)
  $ node proxy.js

  2. Update omsproxy.service

  $ vi /etc/systemd/system/omsproxy.service
```
[Unit]
Description=OMS Proxy

[Service]
Type=simple
ExecStart=/usr/bin/node /home/tacaovy/oms-admin/vnds/ors-admin-proxy/proxy.js
Restart=always

[Install]
WantedBy=multi-user.target
```
  $ sudo systemctl daemon-reload
  $ sudo systemctl start omsproxy.service 
  $ sudo systemctl status omsproxy.service
  $ sudo systemctl enable omsproxy.service

  3. Update .env

# Grafana (link download tham khảo tại: https://grafana.com/grafana/download/8.5.14?edition=oss)
  $ sudo apt-get install -y adduser libfontconfig1 musl
  $ wget https://dl.grafana.com/oss/release/grafana_8.5.14_amd64.deb
  $ sudo dpkg -i grafana_8.5.14_amd64.deb
  $ sudo grafana-cli plugins install jdbranham-diagram-panel
  $ sudo grafana-cli plugins install marcusolsson-json-datasource
  $ sudo grafana-cli plugins install camptocamp-prometheus-alertmanager-datasource
  $ sudo chown -R grafana /var/lib/grafana/plugins
  - Thay đổi tham số trong /etc/grafana/grafana.ini
  $ vi /etc/grafana/grafana.ini
```
allow_loading_unsigned_plugins = "koha-Button"
```
  $ sudo systemctl daemon-reload
  $ sudo systemctl start grafana-server
  $ sudo systemctl status grafana-server
  $ sudo systemctl enable grafana-server
  $ sudo ufw allow 13111
  
  - Truy cập oms-admin trên trình duyệt qua port 13111 (user/pass default: admin/admin)
  - Tạo team: admin --> add user "admin" to team admin

# Yarn
  $ curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null
  $ echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list  
  $ sudo apt-get update && sudo apt-get install yarn
  
  $ npm install @grafana/toolkit@v8.5.14
  $ yarn build
  ```
  - Nếu lỗi PostCSS
  $ yarn list postcss --pattern postcss
  $ yarn add postcss@^8.4.24
  $ yarn add postcss-discard-comments@5.1.2
  
  - Nếu lỗi liên quan openssl (code: 'ERR_OSSL_EVP_UNSUPPORTED')
  $ export NODE_OPTIONS=--openssl-legacy-provider
  
  - Nếu lỗi: TS5023: Unknown compiler option 'useUnknownInCatchVariables'
  $ npm install typescript@latest
  
  ```
# Prometheus (tham khảo tại: https://computingforgeeks.com/install-prometheus-server-on-debian-ubuntu-linux/   hoặc   https://computingforgeeks.com/how-to-install-prometheus-on-rhel-8/)
  $ sudo groupadd --system prometheus
  $ sudo useradd -s /sbin/nologin --system -g prometheus prometheus
  $ sudo mkdir /var/lib/prometheus
  $ sudo mkdir -p /etc/prometheus/rules /etc/prometheus/rules.d /etc/prometheus/files_sd
  $ for i in rules rules.d files_sd; do sudo mkdir -p /etc/prometheus/${i}; done
  $ sudo apt -y install wget curl vim
  $ mkdir -p /tmp/prometheus && cd /tmp/prometheus
  
  $ curl -s https://api.github.com/repos/prometheus/prometheus/releases/latest | grep browser_download_url | grep linux-amd64 | cut -d '"' -f 4 | wget -qi -
  
  $ tar xvf prometheus*.tar.gz
  
  $ cd prometheus*/
  $ sudo mv prometheus promtool /usr/local/bin/
  $ sudo mv prometheus.yml /etc/prometheus/prometheus.yml
  $ sudo mv consoles/ console_libraries/ /etc/prometheus/
  $ sudo vim /etc/prometheus/prometheus.yml
```
global:
  scrape_interval: 6s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - localhost:9093
scrape_configs:
  - job_name: "OMS-Admin"
    scrape_interval: 10s
    static_configs:
      - targets: ["localhost:13111"]
    scheme: http
    metrics_path: /omsproxy/metrics
```
  $ vi /etc/systemd/system/prometheus.service
```
[Unit]
Description=Prometheus
Documentation=https://prometheus.io/docs/introduction/overview/
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=prometheus
Group=prometheus
ExecReload=/bin/kill -HUP \$MAINPID
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus \
  --web.console.templates=/etc/prometheus/consoles \
  --web.console.libraries=/etc/prometheus/console_libraries \
  --web.listen-address=0.0.0.0:9090 \
  --web.external-url=

SyslogIdentifier=prometheus
Restart=always

[Install]
WantedBy=multi-user.target
```

  $ for i in rules rules.d files_sd; do sudo chown -R prometheus:prometheus /etc/prometheus/${i}; done
  $ for i in rules rules.d files_sd; do sudo chmod -R 775 /etc/prometheus/${i}; done
  $ sudo chown -R prometheus:prometheus /var/lib/prometheus/
  $ sudo systemctl daemon-reload
  $ sudo systemctl start prometheus
  $ sudo systemctl enable prometheus
  $ sudo systemctl status prometheus
  $ sudo ufw allow 9090
```
- Tiếp theo, lên giao diện admin add data source prometheus dựa trên thông tin server cài đặt promethues:
  http://192.168.26.112:9090   
```
# AlertManager
  $ wget https://github.com/prometheus/alertmanager/releases/download/v0.22.2/alertmanager-0.22.2.linux-amd64.tar.gz
  $ tar xvzf alertmanager-0.22.2.linux-amd64.tar.gz
  $ cd alertmanager-0.22.2.linux-amd64
  $ mv amtool alertmanager /usr/local/bin
  $ mv alertmanager.yml /etc/alertmanager
  $ useradd -rs /bin/false alertmanager
  $ chown -R alertmanager:alertmanager /data/alertmanager /etc/alertmanager/*
  $ vi etc/systemd/system/alertmanager.service
```
[Unit]
Description=Prometheus Alertmanager
Wants=network-online.target
After=network-online.target

[Service]
User=alertmanager
Group=alertmanager
Type=simple
ExecStart=/usr/local/bin/alertmanager --config.file /etc/alertmanager/alertmanager.yml --storage.path /var/lib/alertmanager/

[Install]
WantedBy=multi-user.target
```
  $ vi /etc/prometheus/alert_rules.yml
```
groups:
- name: example
  rules:
  - alert: E1 Down
    expr: state{instance="localhost:13111", job="OMS-Admin", service="E1"} == 0
    for: 1m
  - alert: E2 Down
    expr: state{instance="localhost:13111", job="OMS-Admin", service="E2"} == 0
    for: 1m
  - alert: I1 Down
    expr: state{instance="localhost:13111", job="OMS-Admin", service="I1"} == 0
    for: 1m
  - alert: I2 Down
    expr: state{instance="localhost:13111", job="OMS-Admin", service="I2"} == 0
    for: 1m
  - alert: ORS-Sync Down
    expr: state{instance="localhost:13111", job="OMS-Admin", service="ORS-Sync"} == 0
    for: 1m
  - alert: BO-Sync Down
    expr: state{instance="localhost:13111", job="OMS-Admin", service="BO-ORS"} == 0
    for: 1m
  - alert: OMSService1 Down
    expr: state{instance="localhost:13111", job="OMS-Admin", service="OMSService1"} == 0
    for: 1m
  - alert: OMSService2 Down
    expr: state{instance="localhost:13111", job="OMS-Admin", service="OMSService2"} == 0
    for: 1m
  - alert: OrderCache Down
    expr: state{instance="localhost:13111", job="OMS-Admin", service="ORDERCACHE"} == 0
    for: 1m
  - alert: FixEngine Down
    expr: state{instance="localhost:13111", job="OMS-Admin", service="192.168.26.113"} == 0
    for: 1m
```

  $ systemctl start alertmanager
  $ systemctl status alertmanager
  $ systemctl enable alertmanager
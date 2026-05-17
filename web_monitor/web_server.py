from flask import Flask, jsonify, send_file
from waitress import serve
from .hardware_monitor import HWmonitor


class Dashboard:
    def __init__(self) -> None:
        self.monitor = HWmonitor()
        self.app = Flask(f"{self.monitor.hostname}'s monitor")

        @self.app.route("/")
        def index() -> None:
            return send_file("web_monitor/dashboard/index.html")

        @self.app.route("/stats")
        def stats() -> None:
            return jsonify(
                {
                    "usage": self.monitor.get_usages(),
                    "temps": self.monitor.get_temps(),
                    "name": self.monitor.hostname,
                }
            )

    def run(self) -> None:
        print(f"HWmonitor for {self.monitor.hostname} running on port 5000")
        serve(self.app, host="0.0.0.0", port=5000)

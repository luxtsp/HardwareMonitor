from flask import Flask, jsonify, send_file, Response
from waitress import serve
from .hardware_monitor import HWmonitor


class Dashboard:
    """
    The web pannel broadcasting HWmonitor's info.
    """

    def __init__(self) -> None:
        self.monitor = HWmonitor()
        self.app = Flask(
            f"{self.monitor.hostname}'s monitor",
            static_folder="web_monitor/dashboard/static",
        )

        @self.app.route("/")
        def index() -> Response:
            return send_file("web_monitor/dashboard/index.html")

        @self.app.route("/stats")
        def stats() -> Response:
            return jsonify(
                {
                    "usage": self.monitor.get_usages(),
                    "temps": self.monitor.get_temps(),
                    "name": self.monitor.hostname,
                }
            )

    def run(self) -> None:
        """
        Will run the flask app using waitress.
        """
        print(f"HWmonitor for {self.monitor.hostname} running on port 5000")
        serve(self.app, host="0.0.0.0", port=5000)

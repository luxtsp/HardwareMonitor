import psutil
import socket


class HWmonitor:
    """
    HWmonitor will monitor the server.
    """

    def __init__(self) -> None:
        self.hostname = socket.gethostname()
        temps = psutil.sensors_temperatures()
        self.tempkeys = dict()
        for i in temps.keys():
            if i in ("coretemp", "k10temp", "cpu_thermal", "acpitz"):
                self.tempkeys["cpu"] = i
            elif i in ("nouveau", "amdgpu"):
                self.tempkeys["gpu"] = i
            else:
                match i:
                    case "acpitz":
                        self.tempkeys["motherboard"] = i
                    case "nvme":
                        self.tempkeys["nvme"] = i

    def get_temps(self) -> dict[str, float | None]:
        """
        returns a dict.\\
        keys are: "cpu", "gpu", "motherboard", "nvme"\\
        each key contains a float of the component's temperature in Celsius
        """
        temp_dict: dict[str, float | None] = {
            "cpu": None,
            "gpu": None,
            "motherboard": None,
            "nvme": None,
        }
        temps = psutil.sensors_temperatures()
        for component, sensor_key in self.tempkeys.items():
            if sensor_key in temps:
                temp_dict[component] = temps[sensor_key][0].current
        return temp_dict

    def get_usages(self) -> dict[str, float | None]:
        """
        returns a dict.\\
        keys are: "cpu", "ram", "storage"\\
        each key contains a float of the component's usage in percent
        """
        cpu = psutil.cpu_percent(interval=0.5)
        ram = psutil.virtual_memory().percent
        disk = psutil.disk_usage("/").percent
        return {
            "cpu": cpu,
            "ram": ram,
            "storage": disk,
        }

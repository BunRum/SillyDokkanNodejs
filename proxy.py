import asyncio
from mitmproxy import options
from mitmproxy.tools import dump
from mitmproxy import http
import socket
hostname = socket.gethostname()
IPAddr = socket.gethostbyname(hostname)

class RequestLogger:
    def request(self, flow: http.HTTPFlow):
        if (flow.request.host in ["ishin-global.aktsk.com", "ishin-production.aktsk.jp"]):  
            flow.request.host = "localhost"
            flow.request.port = 8081
            flow.request.scheme = 'https'
            print(flow.request.method, flow.request.pretty_url)
    def response(self, flow: http.HTTPFlow):
        if flow.request.host in ["localhost", IPAddr]:
            # if flow.request.path == "/client_assets":
            print(flow.response)
        

async def start_proxy(host, port):
    opts = options.Options(listen_host=host, listen_port=port,  ssl_insecure=True)

    master = dump.DumpMaster(
        opts,
        with_termlog=False,
        with_dumper=False,
    )
    master.addons.add(RequestLogger())
    
    await master.run()
    return master

print(f"Proxy started. connect at: {IPAddr}:8080")
asyncio.run(start_proxy('', 8080))


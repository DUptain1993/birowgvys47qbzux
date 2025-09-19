"""
Target discovery module for PhantomNet C2 Server
"""

import os
import re
import json
import socket
import logging
import requests
import subprocess
import shutil
from typing import List, Dict, Any

# Optional imports with fallbacks
try:
    import nmap
    NMAP_AVAILABLE = True
except ImportError:
    NMAP_AVAILABLE = False
    logging.warning("python-nmap not available. Network scanning will be limited.")

try:
    import dns.resolver
    DNS_AVAILABLE = True
except ImportError:
    DNS_AVAILABLE = False
    logging.warning("dnspython not available. DNS enumeration will be limited.")

logger = logging.getLogger(__name__)

class TargetDiscovery:
    """Handles target discovery through various methods"""

    def __init__(self):
        self.discovery_methods = [
            self.scan_shodan,
            self.scan_censys,
            self.scan_network,
            self.scan_dns
        ]

    def discover_targets(self, criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Discover targets using all available methods"""
        targets = []
        for method in self.discovery_methods:
            try:
                method_targets = method(criteria)
                targets.extend(method_targets)
            except Exception as e:
                logger.error(f"Discovery method failed: {e}")

        # Remove duplicates based on IP address
        unique_targets = []
        seen_ips = set()
        for target in targets:
            if target['ip'] not in seen_ips:
                unique_targets.append(target)
                seen_ips.add(target['ip'])

        return unique_targets

    def scan_shodan(self, criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scan Shodan API for targets matching criteria"""
        targets = []
        try:
            api_key = os.getenv('SHODAN_API_KEY')
            if not api_key:
                logger.error("Shodan API key not configured")
                return targets

            query = criteria.get('query', 'product:"Apache httpd"')
            page = criteria.get('page', 1)

            response = requests.get(
                f'https://api.shodan.io/shodan/host/search?key={api_key}&query={query}&page={page}'
            )

            if response.status_code == 200:
                results = response.json()
                for result in results.get('matches', []):
                    targets.append({
                        'ip': result.get('ip_str'),
                        'hostname': result.get('hostnames', [''])[0] if result.get('hostnames') else '',
                        'os_info': result.get('os', 'Unknown'),
                        'open_ports': [service.get('port') for service in result.get('data', [])],
                        'services': result.get('data', [])
                    })
        except Exception as e:
            logger.error(f"Shodan scan failed: {e}")

        return targets

    def scan_censys(self, criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scan Censys API for targets matching criteria"""
        targets = []
        try:
            api_id = os.getenv('CENSYS_API_ID')
            api_secret = os.getenv('CENSYS_API_SECRET')
            if not api_id or not api_secret:
                logger.error("Censys API credentials not configured")
                return targets

            query = criteria.get('query', 'services.service_name: HTTP')
            page = criteria.get('page', 1)

            auth = (api_id, api_secret)
            response = requests.post(
                'https://search.censys.io/api/v2/hosts/search',
                auth=auth,
                json={
                    'q': query,
                    'per_page': 50,
                    'page': page
                }
            )

            if response.status_code == 200:
                results = response.json()
                for hit in results.get('result', {}).get('hits', []):
                    targets.append({
                        'ip': hit.get('ip'),
                        'hostname': hit.get('names', [''])[0] if hit.get('names') else '',
                        'os_info': hit.get('operating_system', 'Unknown'),
                        'open_ports': [service.get('port') for service in hit.get('services', [])],
                        'services': hit.get('services', [])
                    })
        except Exception as e:
            logger.error(f"Censys scan failed: {e}")

        return targets

    def scan_network(self, criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Perform network scan using nmap"""
        targets = []
        try:
            network = criteria.get('network', '192.168.1.0/24')
            ports = criteria.get('ports', '22,80,443')

            # Check if nmap is installed
            if shutil.which('nmap') is None:
                logger.error("nmap not installed on server")
                return targets

            # Run nmap scan
            cmd = ['nmap', '-sS', '-p', ports, '-oX', '-', network]
            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode == 0:
                # Parse XML output (simplified)
                # In a real implementation, you'd use an XML parser
                ip_pattern = r'<address addr="([\d.]+)" addrtype="ipv4"></address>'
                hostname_pattern = r'<hostname name="([^"]+)"'
                port_pattern = r'<port protocol="tcp" portid="(\d+)"><state state="open"/>'

                ips = re.findall(ip_pattern, result.stdout)
                hostnames = re.findall(hostname_pattern, result.stdout)
                open_ports = re.findall(port_pattern, result.stdout)

                # Process results
                for ip in ips:
                    targets.append({
                        'ip': ip,
                        'hostname': hostnames[ips.index(ip)] if ips.index(ip) < len(hostnames) else '',
                        'os_info': 'Unknown',
                        'open_ports': list(set(open_ports)),
                        'services': []
                    })
        except Exception as e:
            logger.error(f"Network scan failed: {e}")

        return targets

    def scan_dns(self, criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Perform DNS enumeration"""
        targets = []
        try:
            domain = criteria.get('domain', 'example.com')
            wordlist_path = criteria.get('wordlist', '/usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt')

            # Check if wordlist exists
            if not os.path.exists(wordlist_path):
                logger.error(f"Wordlist not found: {wordlist_path}")
                return targets

            # Read wordlist
            with open(wordlist_path, 'r') as f:
                subdomains = [line.strip() for line in f.readlines()[:100]]  # Limit to first 100 for speed

            # Perform DNS lookups
            for subdomain in subdomains:
                fqdn = f"{subdomain}.{domain}"
                try:
                    ip = socket.gethostbyname(fqdn)
                    targets.append({
                        'ip': ip,
                        'hostname': fqdn,
                        'os_info': 'Unknown',
                        'open_ports': [],
                        'services': []
                    })
                except:
                    pass
        except Exception as e:
            logger.error(f"DNS scan failed: {e}")

        return targets

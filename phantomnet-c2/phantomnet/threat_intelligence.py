"""
Threat intelligence module for PhantomNet C2 Server
"""

import os
import logging
import requests
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class ThreatIntelligence:
    """Handles threat intelligence lookups and reputation scoring"""

    def __init__(self):
        self.intel_sources = [
            'virustotal',
            'abuseipdb',
            'alienvault'
        ]

    def check_target_reputation(self, target_ip: str) -> float:
        """Check target IP reputation across all intelligence sources"""
        reputation_score = 0.0
        active_sources = 0

        for source in self.intel_sources:
            try:
                score = self._check_source(source, target_ip)
                if score is not None:
                    reputation_score += score
                    active_sources += 1
            except Exception as e:
                logger.error(f"Intel source {source} failed: {e}")

        # Return average score, default to 0.5 if no sources available
        return reputation_score / active_sources if active_sources > 0 else 0.5

    def _check_source(self, source: str, target_ip: str) -> float:
        """Check target IP against a specific threat intelligence source"""
        try:
            if source == 'virustotal':
                return self._check_virustotal(target_ip)
            elif source == 'abuseipdb':
                return self._check_abuseipdb(target_ip)
            elif source == 'alienvault':
                return self._check_alienvault(target_ip)
        except Exception as e:
            logger.error(f"Threat intelligence check failed for {source}: {e}")

        return 0.5  # Default neutral score

    def _check_virustotal(self, target_ip: str) -> float:
        """Check target IP against VirusTotal"""
        api_key = os.getenv('VIRUSTOTAL_API_KEY')
        if not api_key:
            logger.warning("VirusTotal API key not configured")
            return 0.5

        try:
            headers = {'x-apikey': api_key}
            response = requests.get(
                f'https://www.virustotal.com/api/v3/ip_addresses/{target_ip}',
                headers=headers,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                malicious = data.get('data', {}).get('attributes', {}).get('last_analysis_stats', {}).get('malicious', 0)
                total = sum(data.get('data', {}).get('attributes', {}).get('last_analysis_stats', {}).values())

                if total > 0:
                    return malicious / total
                return 0.0
            else:
                logger.warning(f"VirusTotal API returned status {response.status_code}")
                return 0.5

        except Exception as e:
            logger.error(f"VirusTotal check failed: {e}")
            return 0.5

    def _check_abuseipdb(self, target_ip: str) -> float:
        """Check target IP against AbuseIPDB"""
        api_key = os.getenv('ABUSEIPDB_API_KEY')
        if not api_key:
            logger.warning("AbuseIPDB API key not configured")
            return 0.5

        try:
            params = {
                'ipAddress': target_ip,
                'maxAgeInDays': 90
            }
            headers = {'Key': api_key}
            response = requests.get(
                'https://api.abuseipdb.com/api/v2/check',
                params=params,
                headers=headers,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                abuse_score = data.get('data', {}).get('abuseConfidenceScore', 50)
                return abuse_score / 100.0
            else:
                logger.warning(f"AbuseIPDB API returned status {response.status_code}")
                return 0.5

        except Exception as e:
            logger.error(f"AbuseIPDB check failed: {e}")
            return 0.5

    def _check_alienvault(self, target_ip: str) -> float:
        """Check target IP against AlienVault OTX"""
        api_key = os.getenv('OTX_API_KEY')
        if not api_key:
            logger.warning("AlienVault OTX API key not configured")
            return 0.5

        try:
            headers = {'X-OTX-API-KEY': api_key}
            response = requests.get(
                f'https://otx.alienvault.com/api/v1/indicators/IPv4/{target_ip}/general',
                headers=headers,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                pulse_count = data.get('pulse_info', {}).get('count', 0)
                # Cap at 1.0, higher pulse count indicates more malicious activity
                return min(pulse_count / 10, 1.0)
            else:
                logger.warning(f"AlienVault OTX API returned status {response.status_code}")
                return 0.5

        except Exception as e:
            logger.error(f"AlienVault OTX check failed: {e}")
            return 0.5

    def bulk_check_reputation(self, target_ips: List[str]) -> Dict[str, float]:
        """Check reputation for multiple IPs efficiently"""
        results = {}
        for ip in target_ips:
            results[ip] = self.check_target_reputation(ip)
        return results

    def get_source_status(self) -> Dict[str, bool]:
        """Check which intelligence sources are configured and available"""
        status = {}
        for source in self.intel_sources:
            if source == 'virustotal':
                status[source] = bool(os.getenv('VIRUSTOTAL_API_KEY'))
            elif source == 'abuseipdb':
                status[source] = bool(os.getenv('ABUSEIPDB_API_KEY'))
            elif source == 'alienvault':
                status[source] = bool(os.getenv('OTX_API_KEY'))
        return status

    def get_reputation_summary(self, target_ip: str) -> Dict[str, Any]:
        """Get detailed reputation information for a target"""
        summary = {
            'ip': target_ip,
            'overall_score': 0.0,
            'sources': {},
            'recommendation': 'unknown'
        }

        scores = []
        for source in self.intel_sources:
            score = self._check_source(source, target_ip)
            summary['sources'][source] = score
            if score is not None:
                scores.append(score)

        if scores:
            summary['overall_score'] = sum(scores) / len(scores)

            # Provide recommendation based on score
            if summary['overall_score'] < 0.3:
                summary['recommendation'] = 'safe'
            elif summary['overall_score'] < 0.7:
                summary['recommendation'] = 'suspicious'
            else:
                summary['recommendation'] = 'malicious'

        return summary

import json

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_backend_health_and_dashboard_data():
    health = client.get('/health')
    assert health.status_code == 200
    assert health.json()['status'] == 'healthy'

    admin_login = client.post('/api/auth/login', json={
        'email': 'madhulikagoddumarri@gmail.com',
        'password': '123456789'
    })
    assert admin_login.status_code == 200
    token = admin_login.json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    dashboard = client.get('/api/admin/dashboard-stats', headers=headers)
    assert dashboard.status_code == 200
    payload = dashboard.json()
    assert 'stats' in payload
    assert 'charts' in payload
    assert 'users_by_role' in payload['charts']

    notifications = client.get('/api/notifications', headers=headers)
    assert notifications.status_code == 200
    assert isinstance(notifications.json().get('notifications'), list)

    report = client.get('/api/reports/summary', headers=headers)
    assert report.status_code == 200
    assert isinstance(report.json().get('summary'), dict)


def test_role_dashboard_summary_for_manufacturer_user():
    resp = client.post('/api/auth/login', json={
        'email': 'mfg@twip.org',
        'password': 'Password123'
    })
    assert resp.status_code == 200
    token = resp.json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    summary = client.get('/api/dashboard/summary', headers=headers)
    assert summary.status_code == 200
    summary_data = summary.json()
    assert 'user' in summary_data
    assert 'metrics' in summary_data
    assert 'charts' in summary_data


def test_recycling_report_endpoints_for_manufacturer_user():
    resp = client.post('/api/auth/login', json={
        'email': 'mfg@twip.org',
        'password': 'Password123'
    })
    assert resp.status_code == 200
    token = resp.json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    pdf_resp = client.get('/api/reports/recycling/pdf', headers=headers)
    assert pdf_resp.status_code == 200
    assert 'application/pdf' in pdf_resp.headers.get('content-type', '').lower()

    excel_resp = client.get('/api/reports/recycling/excel', headers=headers)
    assert excel_resp.status_code == 200
    assert 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' in excel_resp.headers.get('content-type', '').lower()

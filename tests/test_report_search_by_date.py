def test_report_search_by_date(client, admin_token):
    response = client.get("/reports/search?date=2025-01-01", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

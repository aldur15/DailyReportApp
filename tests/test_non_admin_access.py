def test_non_admin_access(client, non_admin_token):
    response = client.get("/reports/search", headers={"Authorization": f"Bearer {non_admin_token}"})
    assert response.status_code == 403

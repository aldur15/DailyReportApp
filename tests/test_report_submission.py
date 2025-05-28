def test_report_submission(client, user_token):
    payload = {"title": "Test", "summary": "Test summary", "date": "2025-01-01"}
    response = client.post("/reports", json=payload, headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 200

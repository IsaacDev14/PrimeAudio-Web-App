import httpx

def main():
    print("Verifying backend endpoints against PostgreSQL with longer timeout...")
    try:
        r = httpx.get("http://localhost:8000/", timeout=30.0)
        print(f"Root endpoint status: {r.status_code}")
        print(f"Root response: {r.json()}")
        
        r2 = httpx.get("http://localhost:8000/products/", timeout=30.0, follow_redirects=True)
        print(f"Products endpoint status: {r2.status_code}")
        print(f"Products counts: {len(r2.json())}")
        if len(r2.json()) > 0:
            print("Successfully retrieved products from Neon Postgres DB!")
    except Exception as e:
        print(f"Error verifying: {e}")

if __name__ == "__main__":
    main()

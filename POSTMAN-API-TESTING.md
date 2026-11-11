# Postman API testing

Set `baseUrl` to `http://localhost:5000`. The API uses an HttpOnly cookie for authentication. Keep Postman's cookie jar enabled for `localhost`.

## Customer flow
1. `GET {{baseUrl}}/api/health`
2. `GET {{baseUrl}}/api/products` (returns an empty list until an admin adds products)
3. `POST {{baseUrl}}/api/auth/register` JSON: `{"name":"Demo User","email":"demo@example.com","password":"Password123"}`
4. `POST {{baseUrl}}/api/auth/login` JSON: `{"email":"demo@example.com","password":"Password123"}`
5. `GET {{baseUrl}}/api/auth/me`
6. After an admin has created a product, copy its `_id`: `POST {{baseUrl}}/api/cart` JSON: `{"productId":"PRODUCT_ID","quantity":1}`
7. `GET {{baseUrl}}/api/cart`
8. `POST {{baseUrl}}/api/wishlist/PRODUCT_ID`
9. `POST {{baseUrl}}/api/orders` JSON: `{"name":"Demo User","email":"demo@example.com","phone":"9876543210","address":"House 1, Main Road","city":"Gorakhpur","pin":"273001"}`
10. `GET {{baseUrl}}/api/orders/my`

## Admin flow
Create an admin account from the project root with `npm run create-admin -- admin@example.com StrongPassword123 "Store Administrator"`. Sign in at `/admin-login.html` or call `POST {{baseUrl}}/api/auth/login` using that account. Then test:
- `GET {{baseUrl}}/api/admin/stats`
- `GET {{baseUrl}}/api/admin/products`
- `GET {{baseUrl}}/api/admin/users`
- `POST {{baseUrl}}/api/products` JSON: `{"name":"Sample headphones","category":"Electronics","price":1999,"stock":10,"image":"images/headphone.jpg","desc":"Wireless everyday headphones"}`
- `PUT {{baseUrl}}/api/products/PRODUCT_ID`
- `DELETE {{baseUrl}}/api/products/PRODUCT_ID` (archives, does not hard-delete)
- `GET {{baseUrl}}/api/orders`
- `PATCH {{baseUrl}}/api/orders/ORDER_ID/status` JSON: `{"status":"Processing"}`

A normal customer account must receive `403` for admin-only endpoints.

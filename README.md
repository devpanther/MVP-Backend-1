## Project description

Design an API for a vending machine, allowing users with a “seller” role to add, update or remove products, while users with a “buyer” role can deposit coins into the machine and make purchases. Your vending machine should only accept 5, 10, 20, 50 and 100 cent coins

### Running the project

1.  Clone the repository to your local machine.
2.  Install the required dependencies using the command `npm install`.
3.  Create a `.env` file in the root directory of the project and add the following environment variables:

```Makefile
JWT_SECRET="hfY0zgEsCpSXTx87VOAUCeIdfgjxXv5XO"
PORT=8080
```

4.  Start the server using the command npm start. The server should now be running on http://localhost:8080.

### API endpoints

API endpoints are available on Postman

https://www.postman.com/payload-geoscientist-25274531/workspace/public/collection/19633476-f4ca7ed3-31f4-4cd9-9f2d-9ea9e4c25d61?action=share&creator=19633476

### Testing

Run the command `npm test` to run the tests.

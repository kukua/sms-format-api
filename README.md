# SMS Format API

## Setup

```bash
git clone https://github.com/Kukua/sms-format-api.git
cd sms-format-api/
cp .env.example .env
chmod 600 .env
# > Edit .env

# Development
yarn install
npm run watch

# Production
docker-compose build
docker-compose run --rm api yarn install --production
docker-compose up -d # Exposes port 8080
```

## Usage

Query parameters:

- `phone_number`: Single phone number (e.g. `+2330123456789`)
- `phone_numbers[]`: Array of phone numbers.
- `latitude` and `longitude`: Forecast coordinate.
- `location` (optional): Text message is prefixed with this location.
	If not provided the station's location is used.
	Location will be cut off to fit single SMS.

**NOTE:** The `+` in a phone number must be URI encoded to `%2b`.

```bash
curl -v 'http://localhost:8080/v1/format?phone_numbers\[\]=0031612345678&latitude=52.071479&longitude=5.107051&location=Test+location' \
	-H "Authorization: Basic $(echo -n 'username:password' | base64)" \
	| jq
{
  "phone_numbers": [
    "+31612345678"
  ],
  "location": "Test location",
  "latitude": 52.071479,
  "longitude": 5.107051,
  "text": "TEST LOC. Jul 28\nMorn rain 1mm 27% temp 16C wind SW 18kmh hum 87%\nAft rain 1mm 56% temp 18C wind W 29kmh hum 70%\nEve rain 1mm 26% temp 19C wind SW 22kmh hum 70%"
}
```

**NOTE:** The SMS `text` has a maximum length of 160 characters.

## License

This software is licensed under the [MIT license](https://github.com/kukua/sms-format-api/blob/master/LICENSE).

© 2017 Kukua BV

# SMS Format API

## Usage

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

## License

This software is licensed under the [MIT license](https://github.com/kukua/sms-format-api/blob/master/LICENSE).

© 2017 Kukua BV

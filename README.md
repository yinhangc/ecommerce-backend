## Development

```bash
# DB
$ docker compose --env-file .env.development up
```

```bash
# Migrate the DB: may need to get dotenv by ${npm config get prefix}/bin/dotenv
$ dotenv -e .env.development npx prisma migrate dev
```

- Use IPv4 from ifconfig as host when connecting to pgadmin

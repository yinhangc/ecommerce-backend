## Development

```bash
# DB
$ docker compose --env-file .env.development up
```

```bash
# Migrate the DB
$ dotenv -e .env.development npx prisma migrate dev --name "init"
```

- Use IPv4 from ifconfig as host when connecting to pgadmin

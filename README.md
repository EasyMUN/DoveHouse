# DoveHouse

> 咕咕咕

懒了用中文写 README

这是给 ROMUNC 19 用的报名和学测 WebApp。希望能多用几年 （笑

## Compiling & Running

```bash
# Frontend
cd frontend
yarn --frozen-lockfile
yarn build

# Then the built assets will lie under dist/
cd ..

# Backend
cd backend
yarn --frozen-lockfile
# Start mongodb
systemctl start mongodb

# Set config
cp config.example.mjs config.mjs
editor config.mjs

yarn start
```

## License
All work under this repository is distributed under the AGPLv3 public license. A copy of the license can be found in the LICENSE file.

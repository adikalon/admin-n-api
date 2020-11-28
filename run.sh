if [ ${NODE_ENV} = "development" ]; then
  npm run start:dev
elif [ ${NODE_ENV} = "debug" ]; then
  npm run start:debug
else
  npm run start:prod
fi

dotnet build; cat ./swagger.json | node ../../../scripts/sort-json.js > swagger-asp.json; cat ../swagger.json | node ../../../scripts/sort-json.js > swagger-tsoa.json

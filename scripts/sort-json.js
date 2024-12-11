function sortObjectKeysRecursively(inputObject) {
  if (Array.isArray(inputObject)) {
    const newArray = [];

    for (let i = 0; i < inputObject.length; i += 1) {
      newArray[i] = sortObjectKeysRecursively(inputObject[i]);
    }

    if (typeof newArray[0] === 'string') {
      newArray.sort((a, b) => a.localeCompare(b));
    }

    return newArray;
  }

  if (typeof inputObject !== 'object' || inputObject === null) {
    return inputObject;
  }

  const newObject = {};

  const sortedKeys = Object.keys(inputObject).sort();

  for (let i = 0; i < sortedKeys.length; i += 1) {
    newObject[sortedKeys[i]] = sortObjectKeysRecursively(
      inputObject[sortedKeys[i]]
    );
  }

  return newObject;
}

let data = '';

process.stdin.on('readable', () => {
  let chunk;

  while (null !== (chunk = process.stdin.read())) {
    data += chunk;
  }
});

process.stdin.on('end', () => {
  // process all the data and write it back to stdout

  process.stdout.write(
    JSON.stringify(sortObjectKeysRecursively(JSON.parse(data)), null, 2)
  );
});
